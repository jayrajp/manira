'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice, formatDate } from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, MapPin, CreditCard, User, Truck, IndianRupee, ExternalLink } from 'lucide-react';

const STATUS_OPTIONS = ['pending','processing','confirmed','shipped','out_for_delivery','delivered','cancelled','returned'];

const STATUS_COLORS = {
  pending:          'bg-yellow-100 text-yellow-700',
  processing:       'bg-indigo-100 text-indigo-700',
  confirmed:        'bg-blue-100 text-blue-700',
  shipped:          'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  returned:         'bg-orange-100 text-orange-700',
};

export default function OrderDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState('');
  const [awb,     setAwb]     = useState('');
  const [courier, setCourier] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => {
        setOrder(r.data);
        setStatus(r.data.status || '');
        setAwb(r.data.awbNumber || '');
        setCourier(r.data.courierPartner || '');
      })
      .catch(() => { toast.error('Order not found'); router.push('/orders'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      setOrder(o => ({ ...o, status }));
    } catch { toast.error('Failed to update status'); }
    setSaving(false);
  };

  const handleSaveTracking = async () => {
    setSaving(true);
    try {
      await api.patch(`/orders/${id}/tracking`, { awbNumber: awb, courierPartner: courier });
      toast.success('Tracking updated');
      setOrder(o => ({ ...o, awbNumber: awb, courierPartner: courier }));
    } catch { toast.error('Failed to update tracking'); }
    setSaving(false);
  };

  if (loading) return (
    <AdminLayout title="Order Detail">
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    </AdminLayout>
  );
  if (!order) return null;

  return (
    <AdminLayout title={`Order ${order.orderNumber}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft size={16} /> Back to Orders
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Items */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={16} className="text-gold" /> Order Items
              </h3>
              <div className="divide-y divide-gray-50">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                      {item.productImage
                        ? <Image src={item.productImage} alt={item.productName} fill className="object-cover" unoptimized />
                        : <div className="w-full h-full flex items-center justify-center text-xl">💍</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                      {(item.variant || item.size) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[item.variant, item.size && `Size: ${item.size}`].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                      <p className="text-xs font-semibold text-gold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Totals */}
              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Free'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span><span className="text-gold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Update Order Status</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="label">Status</label>
                  <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <button onClick={handleSaveStatus} disabled={saving}
                  className="btn-primary text-xs px-5 py-2.5 disabled:opacity-60 whitespace-nowrap">
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>

            {/* Manual Tracking Update */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Manual Tracking</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">AWB / Tracking Number</label>
                  <input className="input" placeholder="e.g. SR123456789IN"
                    value={awb} onChange={e => setAwb(e.target.value)} />
                </div>
                <div>
                  <label className="label">Courier Partner</label>
                  <input className="input" placeholder="e.g. Delhivery, Blue Dart"
                    value={courier} onChange={e => setCourier(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={handleSaveTracking} disabled={saving}
                  className="btn-primary text-xs px-5 py-2 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Update Tracking'}
                </button>
              </div>
            </div>

            {/* Shiprocket Panel */}
            <ShiprocketPanel order={order} setOrder={setOrder} />

            {/* Razorpay Refund Panel */}
            {order.razorpayPaymentId && <RefundPanel order={order} setOrder={setOrder} />}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={16} className="text-gold" /> Customer
              </h3>
              <p className="text-sm font-semibold text-gray-800">{order.customerName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.email}</p>
              <p className="text-xs text-gray-500">{order.phone}</p>
            </div>

            {/* Delivery Address */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-gold" /> Delivery Address
              </h3>
              <div className="text-xs text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-800">{order.customerName}</p>
                <p className="leading-relaxed">{order.addressLine}</p>
                <p>{order.city} - {order.pincode}</p>
                <p>{order.state}</p>
                <p className="text-gray-500 mt-1">{order.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-gold" /> Payment
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gold">{formatPrice(order.total)}</span>
                </div>
                {order.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">RZP Order</span>
                    <span className="font-mono text-[10px] text-gray-500">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">RZP Payment</span>
                    <span className="font-mono text-[10px] text-gray-500">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            {(order.awbNumber || order.shiprocketOrderId) && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-gold" /> Shipping
                </h3>
                <div className="space-y-1.5 text-xs">
                  {order.awbNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">AWB</span>
                      <span className="font-mono font-semibold text-gray-700">{order.awbNumber}</span>
                    </div>
                  )}
                  {order.courierPartner && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Courier</span>
                      <span className="text-gray-700">{order.courierPartner}</span>
                    </div>
                  )}
                  {order.shiprocketOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">SR Order</span>
                      <span className="font-mono text-[10px] text-gray-500">{order.shiprocketOrderId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Shiprocket Panel ──────────────────────────────────────────────────────────
function ShiprocketPanel({ order, setOrder }) {
  const [weight,   setWeight]   = useState('0.3');
  const [couriers, setCouriers] = useState([]);
  const [loading,  setLoading]  = useState('');

  const doAction = async (action, body = {}) => {
    setLoading(action);
    try {
      switch (action) {
        case 'create': {
          const r = await api.post(`/orders/${order.id}/shiprocket`, { weight: Number(weight), ...body });
          toast.success(`Shipment created! SR Order: ${r.data.shiprocketOrderId}`);
          setOrder(o => ({ ...o,
            shiprocketOrderId:    r.data.shiprocketOrderId,
            shiprocketShipmentId: r.data.shiprocketShipmentId,
          }));
          break;
        }
        case 'awb': {
          const r = await api.post(`/orders/${order.id}/shiprocket/awb`, body);
          toast.success(`AWB assigned: ${r.data.awb} via ${r.data.courier}`);
          setOrder(o => ({ ...o,
            shiprocketAwbCode: r.data.awb,
            awbNumber:         r.data.awb,
            courierPartner:    r.data.courier,
            status:            'shipped',
          }));
          break;
        }
        case 'pickup': {
          await api.post(`/orders/${order.id}/shiprocket/pickup`);
          toast.success('Pickup scheduled successfully!');
          break;
        }
        case 'track': {
          const r = await api.get(`/orders/${order.id}/track`);
          const td = r.data.trackingData;
          const latest = td?.shipment_track?.[0]?.current_status || 'No update';
          toast.success(`Status: ${latest}`);
          console.log('[Shiprocket Tracking]', r.data);
          break;
        }
        case 'cancel': {
          if (!confirm('Cancel this Shiprocket shipment? This cannot be undone.')) break;
          await api.delete(`/orders/${order.id}/shiprocket`);
          toast.success('Shipment cancelled');
          setOrder(o => ({ ...o,
            shiprocketOrderId:    null,
            shiprocketShipmentId: null,
            shiprocketAwbCode:    null,
          }));
          break;
        }
        case 'serviceability': {
          const r = await api.get(`/orders/${order.id}/serviceability?weight=${weight}`);
          const list = r.data.available_courier_companies || [];
          setCouriers(list);
          if (list.length === 0) toast.error('No couriers available for this pincode');
          else toast.success(`${list.length} courier(s) available`);
          break;
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `${action} failed`);
    }
    setLoading('');
  };

  const hasSR     = !!order.shiprocketOrderId;
  const hasAWB    = !!(order.shiprocketAwbCode || order.awbNumber);
  const isLoading = (a) => loading === a;

  const Btn = ({ action, label, className = '', disabled = false }) => (
    <button onClick={() => doAction(action)} disabled={!!loading || disabled}
      className={`text-xs px-3 py-1.5 rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5
        ${className || 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
      {isLoading(action) && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {isLoading(action) ? 'Processing...' : label}
    </button>
  );

  return (
    <div className="card border-2 border-dashed border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Truck size={16} className="text-gold" /> Shiprocket Delivery
      </h3>

      {/* Current Shiprocket state */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-5 bg-gray-50 rounded-lg p-3">
        <span className="text-gray-500">SR Order ID</span>
        <span className="font-mono text-gray-700">{order.shiprocketOrderId || '—'}</span>
        <span className="text-gray-500">Shipment ID</span>
        <span className="font-mono text-gray-700">{order.shiprocketShipmentId || '—'}</span>
        <span className="text-gray-500">AWB / Tracking</span>
        <span className="font-mono font-semibold text-gray-800">{order.shiprocketAwbCode || order.awbNumber || '—'}</span>
        <span className="text-gray-500">Courier</span>
        <span className="text-gray-700">{order.courierPartner || '—'}</span>
      </div>

      {/* Weight input */}
      <div className="mb-4 flex items-center gap-3">
        <div>
          <label className="label">Package Weight (kg)</label>
          <input type="number" step="0.1" min="0.1" max="10" className="input w-28 text-sm"
            value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <p className="text-[11px] text-gray-400 mt-4">Jewellery avg: 0.3–0.5 kg</p>
      </div>

      {/* Workflow steps */}
      <div className="mb-3">
        <p className="text-[11px] text-gray-400 mb-2 font-medium uppercase tracking-wide">
          Workflow: Create → Assign AWB → Schedule Pickup → Track
        </p>
        <div className="flex flex-wrap gap-2">
          {!hasSR && (
            <Btn action="create" label="1. Create Shipment" className="bg-gold text-white hover:bg-yellow-600" />
          )}
          {hasSR && !hasAWB && (
            <>
              <Btn action="serviceability" label="2a. Check Couriers" className="bg-gray-100 text-gray-700 hover:bg-gray-200" />
              <Btn action="awb" label="2b. Auto-Assign AWB" className="bg-blue-600 text-white hover:bg-blue-700" />
            </>
          )}
          {hasAWB && (
            <Btn action="pickup" label="3. Schedule Pickup" className="bg-purple-600 text-white hover:bg-purple-700" />
          )}
          {hasAWB && (
            <Btn action="track" label="4. Refresh Tracking" className="bg-gray-100 text-gray-700 hover:bg-gray-200" />
          )}
        </div>
      </div>

      {/* Danger */}
      {hasSR && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Btn action="cancel" label="Cancel Shiprocket Shipment" className="bg-red-50 text-red-600 hover:bg-red-100" />
        </div>
      )}

      {/* Available couriers list */}
      {couriers.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Available Couriers — click Assign to use one</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {couriers.map(c => (
              <div key={c.courier_company_id}
                className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{c.courier_name}</p>
                  <p className="text-gray-400">{c.estimated_delivery_days} day(s) · ₹{c.rate}</p>
                </div>
                <button onClick={() => doAction('awb', { courierId: c.courier_company_id })}
                  disabled={!!loading}
                  className="text-[11px] bg-gold text-white px-3 py-1 rounded font-semibold hover:bg-yellow-600 disabled:opacity-50">
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Razorpay Refund Panel ─────────────────────────────────────────────────────
function RefundPanel({ order, setOrder }) {
  const [refundAmt, setRefundAmt] = useState('');
  const [reason,    setReason]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [payment,   setPayment]   = useState(null);

  useEffect(() => {
    api.get(`/orders/${order.id}/payment`)
      .then(r => setPayment(r.data.payment))
      .catch(() => {});
  }, [order.id]);

  const handleRefund = async () => {
    const amt = refundAmt ? Number(refundAmt) : null;
    if (!confirm(`Issue ${amt ? `partial refund of ₹${amt}` : 'FULL refund'}?`)) return;
    setLoading(true);
    try {
      const body = { reason: reason || undefined };
      if (amt) body.amount = amt;
      const r = await api.post(`/orders/${order.id}/refund`, body);
      toast.success(`Refund ₹${r.data.amount} initiated!`);
      setOrder(o => ({ ...o, paymentStatus: 'refunded', refundId: r.data.refundId }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    }
    setLoading(false);
  };

  const alreadyRefunded = order.paymentStatus === 'refunded';

  return (
    <div className="card border border-red-100">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <IndianRupee size={16} className="text-red-500" /> Razorpay Refund
      </h3>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4 bg-gray-50 rounded-lg p-3">
        <span className="text-gray-500">Payment ID</span>
        <span className="font-mono text-[10px] text-gray-600">{order.razorpayPaymentId}</span>
        <span className="text-gray-500">Paid Amount</span>
        <span className="font-semibold text-gray-800">
          {payment ? formatPrice(payment.amount / 100) : formatPrice(order.total)}
        </span>
        {order.refundId && (
          <>
            <span className="text-gray-500">Refund ID</span>
            <span className="font-mono text-[10px] text-gray-600">{order.refundId}</span>
          </>
        )}
      </div>

      {alreadyRefunded ? (
        <div className="bg-green-50 text-green-700 text-xs px-3 py-2.5 rounded-lg font-medium text-center">
          ✅ Refund already processed
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="label">Refund Amount ₹ (leave blank for full refund)</label>
            <input type="number" className="input" placeholder={`Max: ${formatPrice(order.total)}`}
              value={refundAmt} onChange={e => setRefundAmt(e.target.value)} />
          </div>
          <div>
            <label className="label">Reason</label>
            <input className="input" placeholder="e.g. Customer request, damaged item"
              value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <button onClick={handleRefund} disabled={loading}
            className="w-full bg-red-600 text-white text-xs py-2.5 rounded font-semibold hover:bg-red-700 disabled:opacity-60">
            {loading ? 'Processing Refund...' : `Issue ${refundAmt ? `₹${refundAmt}` : 'Full'} Refund`}
          </button>
        </div>
      )}
    </div>
  );
}
