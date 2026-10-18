import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  email:        z.string().email(),
  phone:        z.string().min(10).max(20),
  addressLine:  z.string().min(5),
  city:         z.string().min(2).max(100),
  pincode:      z.string().length(6),
  state:        z.string().min(2).max(100),
  paymentMethod: z.enum(['upi', 'card', 'netbanking', 'cod']),
  couponCode:   z.string().optional(),
  items: z.array(z.object({
    productId:    z.string().uuid(),
    productName:  z.string(),
    productImage: z.string().optional(),
    sku:          z.string().optional(),
    price:        z.number().int().positive(),
    quantity:     z.number().int().positive(),
    variant:      z.string().optional(),
    size:         z.string().optional(),
  })).min(1),
});

export const validateCouponSchema = z.object({
  code:       z.string().min(1),
  orderTotal: z.number().int().positive(),
});
