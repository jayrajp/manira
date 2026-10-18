import { Request, Response } from 'express';
import Razorpay              from 'razorpay';
import { eq }               from 'drizzle-orm';
import { db }               from '../../db';
import { orders }           from '../../db/schema';
import { env }              from '../../config/env';

const getRazorpay = () =>
  new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });

// GET /admin/orders/:id/payment
// Returns Razorpay payment details + all refunds for this order
export const getPaymentDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

    if (!order.razorpayPaymentId) {
      res.json({ payment: null, refunds: [], message: 'No online payment for this order' });
      return;
    }

    const rzp = getRazorpay();
    const [payment, refundsList] = await Promise.all([
      rzp.payments.fetch(order.razorpayPaymentId),
      rzp.payments.fetchMultipleRefund(order.razorpayPaymentId, {}),
    ]);

    res.json({
      payment,
      refunds:           (refundsList as any).items || [],
      localRefundId:     order.refundId,
      localRefundAmount: order.refundAmount,
      localRefundStatus: order.refundStatus,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.error?.description || err.message || 'Failed to fetch payment' });
  }
};

// POST /admin/orders/:id/refund
// Body: { amount?: number (INR), reason?: string }
// If amount omitted → full refund
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    if (!order.razorpayPaymentId) {
      res.status(400).json({ message: 'No Razorpay payment found for this order' });
      return;
    }
    if (order.refundStatus === 'processed') {
      res.status(400).json({ message: 'Refund already processed for this order' });
      return;
    }

    const rzp     = getRazorpay();
    const payment = await rzp.payments.fetch(order.razorpayPaymentId);
    console.log('[Razorpay] Payment status:', payment.status, '| Amount:', payment.amount);

    // Capture first if still authorized (required before refunding)
    if (payment.status === 'authorized') {
      console.log('[Razorpay] Capturing authorized payment before refund...');
      await rzp.payments.capture(order.razorpayPaymentId, Number(payment.amount), 'INR');
      const captured = await rzp.payments.fetch(order.razorpayPaymentId);
      if (captured.status !== 'captured') {
        res.status(400).json({ message: 'Failed to capture payment before refund' });
        return;
      }
    } else if (payment.status !== 'captured') {
      res.status(400).json({
        message: `Cannot refund — payment status is "${payment.status}". Only captured payments can be refunded.`,
      });
      return;
    }

    // amount in paise; if not given, refund full captured amount
    const refundAmountPaise = amount
      ? Math.round(Number(amount) * 100)
      : Number(payment.amount);

    if (refundAmountPaise > Number(payment.amount)) {
      res.status(400).json({
        message: `Refund amount ₹${amount} exceeds payment amount ₹${Number(payment.amount) / 100}`,
      });
      return;
    }

    const refundBody: Record<string, any> = {
      amount: refundAmountPaise,
      speed:  'normal',
      notes: {
        reason:   reason || 'Admin initiated refund',
        order_id: order.orderNumber,
      },
    };

    console.log('[Razorpay] Initiating refund:', JSON.stringify(refundBody));
    const refund = await (rzp.payments as any).refund(order.razorpayPaymentId, refundBody);
    console.log('[Razorpay] Refund response:', JSON.stringify(refund));

    await db.update(orders).set({
      refundId:      refund.id,
      refundAmount:  refund.amount,   // in paise
      refundStatus:  refund.status,   // 'processed' | 'pending' | 'failed'
      paymentStatus: 'refunded',
      updatedAt:     new Date(),
    }).where(eq(orders.id, id));

    res.json({
      refundId:  refund.id,
      amount:    refund.amount / 100, // INR
      status:    refund.status,
      paymentId: refund.payment_id,
      createdAt: refund.created_at,
      message:   'Refund initiated successfully',
    });
  } catch (err: any) {
    console.error('[Razorpay] Refund error:', JSON.stringify(err?.error || err?.message || err));
    const msg = err?.error?.description || err?.error?.reason || err?.message || 'Refund failed';
    res.status(500).json({ message: msg });
  }
};
