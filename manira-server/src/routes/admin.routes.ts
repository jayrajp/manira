import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware';
import { validate }     from '../middleware/zodValidate.middleware';
import { adminLoginSchema, adminRegisterSchema, changePasswordSchema } from '../validation/admin/auth';
import { createProductSchema, updateProductSchema, bulkDeleteSchema }  from '../validation/admin/products';
import { uploadImage, uploadImages, uploadMedia } from '../helper/s3';

import * as auth       from '../controllers/admin/auth.controller';
import * as products   from '../controllers/admin/products.controller';
import * as categories from '../controllers/admin/categories.controller';
import * as collections from '../controllers/admin/collections.controller';
import * as orders     from '../controllers/admin/orders.controller';
import * as customers  from '../controllers/admin/customers.controller';
import * as inventory  from '../controllers/admin/inventory.controller';
import * as banners    from '../controllers/admin/banners.controller';
import * as coupons    from '../controllers/admin/coupons.controller';
import * as reviewsCtrl from '../controllers/admin/reviews.controller';
import * as masters    from '../controllers/admin/masters.controller';
import * as faqs       from '../controllers/admin/faqs.controller';
import * as reports    from '../controllers/admin/reports.controller';
import * as settingsCtrl from '../controllers/admin/settings.controller';
import * as contacts      from '../controllers/admin/contacts.controller';
import * as announcements  from '../controllers/admin/announcements.controller';
import * as razorpay       from '../controllers/admin/razorpay.controller';
import * as shiprocket     from '../controllers/admin/shiprocket.controller';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/login',    validate(adminLoginSchema),    auth.adminLogin);
router.post('/auth/register', validate(adminRegisterSchema), auth.adminRegister);
router.get ('/auth/profile',  requireAdmin,                  auth.getAdminProfile);
router.put ('/auth/password', requireAdmin, validate(changePasswordSchema), auth.changeAdminPassword);

// ── Upload ────────────────────────────────────────────────────────────────────
router.post('/upload/image',  requireAdmin, (req, res, next) => uploadImage('manira')(req, res, next),  products.uploadProductImage);
router.post('/upload/images', requireAdmin, (req, res, next) => uploadImages('manira')(req, res, next), products.uploadProductImage);
router.post('/upload/media',  requireAdmin, (req, res, next) => uploadMedia('manira')(req, res, next),  products.uploadProductImage);

// ── Products ──────────────────────────────────────────────────────────────────
router.get   ('/products',            requireAdmin, products.getProducts);
router.get   ('/products/:id',        requireAdmin, products.getProductById);
router.post  ('/products',            requireAdmin, validate(createProductSchema), products.createProduct);
router.put   ('/products/:id',        requireAdmin, validate(updateProductSchema), products.updateProduct);
router.delete('/products/bulk',       requireAdmin, validate(bulkDeleteSchema),    products.bulkDeleteProducts);
router.delete('/products/:id',        requireAdmin, products.deleteProduct);

// ── Categories ────────────────────────────────────────────────────────────────
router.get   ('/categories',          requireAdmin, categories.getCategories);
router.post  ('/categories',          requireAdmin, categories.createCategory);
router.put   ('/categories/:id',      requireAdmin, categories.updateCategory);
router.delete('/categories/:id',      requireAdmin, categories.deleteCategory);
router.patch ('/categories/:id/toggle', requireAdmin, categories.toggleCategory);

// ── Collections ────────────────────────────────────────────────────────────────
router.get   ('/collections',         requireAdmin, collections.getCollections);
router.post  ('/collections',         requireAdmin, collections.createCollection);
router.put   ('/collections/:id',     requireAdmin, collections.updateCollection);
router.delete('/collections/:id',     requireAdmin, collections.deleteCollection);
router.patch ('/collections/:id/toggle', requireAdmin, collections.toggleCollection);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get  ('/orders',              requireAdmin, orders.getOrders);
router.get  ('/orders/:id',          requireAdmin, orders.getOrderById);
router.patch('/orders/:id/status',   requireAdmin, orders.updateOrderStatus);
router.patch('/orders/:id/tracking', requireAdmin, orders.updateTracking);

// ── Customers ─────────────────────────────────────────────────────────────────
router.get  ('/customers',           requireAdmin, customers.getCustomers);
router.get  ('/customers/:id',       requireAdmin, customers.getCustomerById);
router.patch('/customers/:id/status',requireAdmin, customers.updateCustomerStatus);

// ── Inventory ─────────────────────────────────────────────────────────────────
router.get  ('/inventory',              requireAdmin, inventory.getInventory);
router.patch('/inventory/:id/stock',   requireAdmin, inventory.updateStock);
router.patch('/inventory/:productId/variants/:variantId/stock', requireAdmin, inventory.updateVariantStock);

// ── Banners ───────────────────────────────────────────────────────────────────
router.get   ('/banners',             requireAdmin, banners.getBanners);
router.post  ('/banners',             requireAdmin, banners.createBanner);
router.put   ('/banners/:id',         requireAdmin, banners.updateBanner);
router.delete('/banners/:id',         requireAdmin, banners.deleteBanner);
router.patch ('/banners/:id/toggle',  requireAdmin, banners.toggleBanner);

// ── Coupons ───────────────────────────────────────────────────────────────────
router.get   ('/coupons',             requireAdmin, coupons.getCoupons);
router.post  ('/coupons',             requireAdmin, coupons.createCoupon);
router.put   ('/coupons/:id',         requireAdmin, coupons.updateCoupon);
router.delete('/coupons/:id',         requireAdmin, coupons.deleteCoupon);
router.patch ('/coupons/:id/toggle',  requireAdmin, coupons.toggleCoupon);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get   ('/reviews',             requireAdmin, reviewsCtrl.getReviews);
router.patch ('/reviews/:id/status',  requireAdmin, reviewsCtrl.updateReviewStatus);
router.delete('/reviews/:id',         requireAdmin, reviewsCtrl.deleteReview);

// ── Masters ───────────────────────────────────────────────────────────────────
router.get   ('/masters/metals',      requireAdmin, masters.getMetals);
router.post  ('/masters/metals',      requireAdmin, masters.createMetal);
router.put   ('/masters/metals/:id',  requireAdmin, masters.updateMetal);
router.delete('/masters/metals/:id',  requireAdmin, masters.deleteMetal);

router.get   ('/masters/stones',      requireAdmin, masters.getStones);
router.post  ('/masters/stones',      requireAdmin, masters.createStone);
router.put   ('/masters/stones/:id',  requireAdmin, masters.updateStone);
router.delete('/masters/stones/:id',  requireAdmin, masters.deleteStone);

// ── FAQs ─────────────────────────────────────────────────────────────────────
router.get   ('/products/:productId/faqs', requireAdmin, faqs.getProductFaqs);
router.post  ('/products/:productId/faqs', requireAdmin, faqs.createFaq);
router.put   ('/faqs/:id',                 requireAdmin, faqs.updateFaq);
router.delete('/faqs/:id',                 requireAdmin, faqs.deleteFaq);

// ── Dashboard / Reports ────────────────────────────────────────────────────────
router.get('/dashboard/stats',        requireAdmin, reports.getDashboardStats);
router.get('/dashboard/revenue',      requireAdmin, reports.getRevenueChart);
router.get('/dashboard/top-products', requireAdmin, reports.getTopProducts);
router.get('/dashboard/recent-orders',requireAdmin, reports.getRecentOrders);

// ── Settings ──────────────────────────────────────────────────────────────────
router.get('/settings',              requireAdmin, settingsCtrl.getSettings);
router.put('/settings',              requireAdmin, settingsCtrl.updateSettings);

// ── Contacts ──────────────────────────────────────────────────────────────────
router.get   ('/contacts',            requireAdmin, contacts.getContacts);
router.patch ('/contacts/:id',        requireAdmin, contacts.updateContact);
router.delete('/contacts/:id',        requireAdmin, contacts.deleteContact);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get   ('/announcements',       requireAdmin, announcements.getAnnouncements);
router.post  ('/announcements',       requireAdmin, announcements.createAnnouncement);
router.patch ('/announcements/:id',   requireAdmin, announcements.updateAnnouncement);
router.delete('/announcements/:id',   requireAdmin, announcements.deleteAnnouncement);

// ── Razorpay (payments + refunds) ─────────────────────────────────────────────
router.get ('/orders/:id/payment',   requireAdmin, razorpay.getPaymentDetails);
router.post('/orders/:id/refund',    requireAdmin, razorpay.refundPayment);

// ── Shiprocket (shipment lifecycle) ──────────────────────────────────────────
router.get   ('/shiprocket/status',              requireAdmin, shiprocket.getShiprocketStatus);
router.post  ('/orders/:id/shiprocket',          requireAdmin, shiprocket.createShipment);
router.post  ('/orders/:id/shiprocket/awb',      requireAdmin, shiprocket.assignAwb);
router.post  ('/orders/:id/shiprocket/pickup',   requireAdmin, shiprocket.generatePickup);
router.get   ('/orders/:id/track',               requireAdmin, shiprocket.trackShipment);
router.delete('/orders/:id/shiprocket',          requireAdmin, shiprocket.cancelShipment);
router.get   ('/orders/:id/serviceability',      requireAdmin, shiprocket.checkServiceability);

export default router;
