import { Router } from 'express';
import { requireUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/zodValidate.middleware';
import { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/user/auth';
import { createOrderSchema, validateCouponSchema } from '../validation/user/orders';

import * as auth     from '../controllers/user/auth.controller';
import * as products from '../controllers/user/products.controller';
import * as orders   from '../controllers/user/orders.controller';
import * as wishlist from '../controllers/user/wishlist.controller';
import * as reviews  from '../controllers/user/reviews.controller';
import * as contact  from '../controllers/user/contact.controller';
import * as payment  from '../controllers/user/payment.controller';
import * as settings from '../controllers/user/settings.controller';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/register',        validate(registerSchema),      auth.register);
router.post('/auth/login',           validate(loginSchema),         auth.login);
router.post('/auth/google',                                         auth.googleAuth);
router.post('/auth/verify-email',    validate(verifyOtpSchema),     auth.verifyEmail);
router.post('/auth/resend-otp',                                     auth.resendOtp);
router.post('/auth/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/auth/reset-password',  validate(resetPasswordSchema),  auth.resetPassword);
router.post('/auth/logout',                                         auth.logout);
router.get ('/auth/profile',         requireUser,                   auth.getProfile);
router.put ('/auth/profile',         requireUser,                   auth.updateProfile);
router.put ('/auth/change-password', requireUser,                   auth.changePassword);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products',              products.getProducts);
router.get('/products/featured',     products.getFeaturedProducts);
router.get('/products/new-arrivals', products.getNewArrivals);
router.get('/products/bestsellers',  products.getBestsellers);
router.get('/products/:slug',        products.getProductBySlug);

// ── Catalog ───────────────────────────────────────────────────────────────────
router.get('/categories',    products.getCategories);
router.get('/collections',   products.getCollections);
router.get('/banners',       products.getBanners);

// ── Settings (public) ─────────────────────────────────────────────────────────
router.get('/settings',           settings.getPublicSettings);
router.get('/announcements',      settings.getActiveAnnouncements);

// ── Orders ────────────────────────────────────────────────────────────────────
router.post('/orders',            requireUser, validate(createOrderSchema), orders.createOrder);
router.get ('/orders',            requireUser,                               orders.getUserOrders);
router.get ('/orders/track',      orders.trackOrder);           // ?orderNumber=&email=
router.get ('/orders/:id',        requireUser,                   orders.getOrderById);
router.post('/coupons/validate',  validate(validateCouponSchema),           orders.validateCoupon);

// ── Payment ───────────────────────────────────────────────────────────────────
router.post('/payment/create',  payment.createRazorpayOrder);  // no auth — guests also checkout
router.post('/payment/verify',  payment.verifyRazorpayPayment);
router.post('/payment/cod',     payment.createCodOrder);        // Cash on Delivery — no Razorpay

// ── Wishlist ──────────────────────────────────────────────────────────────────
router.get   ('/wishlist',             requireUser, wishlist.getWishlist);
router.post  ('/wishlist',             requireUser, wishlist.addToWishlist);
router.delete('/wishlist/:productId',  requireUser, wishlist.removeFromWishlist);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.post ('/reviews',              requireUser, reviews.submitReview);
router.patch('/reviews/:id/helpful',               reviews.markHelpful);

// ── Contact ───────────────────────────────────────────────────────────────────
router.post('/contact', contact.submitContact);

export default router;
