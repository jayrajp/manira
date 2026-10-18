import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  date,
} from 'drizzle-orm/pg-core';

// ─── Admin Users ─────────────────────────────────────────────────────────────
export const adminUsers = pgTable('admin_users', {
  id:           varchar('id',            { length: 36  }).primaryKey(),
  name:         varchar('name',          { length: 100 }).notNull(),
  email:        varchar('email',         { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role:         varchar('role',          { length: 20  }).notNull().default('admin'), // 'super_admin' | 'admin'
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Users (Customers) ───────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:               varchar('id',            { length: 36  }).primaryKey(),
  name:             varchar('name',          { length: 100 }).notNull(),
  email:            varchar('email',         { length: 255 }).notNull().unique(),
  phone:            varchar('phone',         { length: 20  }),
  passwordHash:     varchar('password_hash', { length: 255 }),
  emailOtp:         varchar('email_otp',     { length: 6   }),
  otpExpiresAt:     timestamp('otp_expires_at'),
  isEmailVerified:  boolean('is_email_verified').notNull().default(false),
  googleId:         varchar('google_id',     { length: 255 }),
  status:           varchar('status',        { length: 20  }).notNull().default('active'), // 'active' | 'inactive' | 'blocked'
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
});

// ─── Categories ──────────────────────────────────────────────────────────────
// e.g. Necklaces, Earrings, Rings, Bangles, Bracelets, Mangalsutra, Pendants
export const categories = pgTable('categories', {
  id:           varchar('id',          { length: 36  }).primaryKey(),
  name:         varchar('name',        { length: 100 }).notNull(),
  slug:         varchar('slug',        { length: 100 }).notNull().unique(),
  description:  text('description'),
  image:        varchar('image',       { length: 500 }),
  icon:         varchar('icon',        { length: 100 }), // emoji or icon name for nav
  isActive:     boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  productCount: integer('product_count').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Collections ─────────────────────────────────────────────────────────────
// e.g. Phulwari, Cave Chronicles, Bridal Edit, Festive Collection
export const collections = pgTable('collections', {
  id:           varchar('id',          { length: 36  }).primaryKey(),
  name:         varchar('name',        { length: 100 }).notNull(),
  slug:         varchar('slug',        { length: 100 }).notNull().unique(),
  description:  text('description'),
  image:        varchar('image',       { length: 500 }),
  isActive:     boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  productCount: integer('product_count').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Metal Master ─────────────────────────────────────────────────────────────
// e.g. Gold, Silver, Rose Gold, Platinum, Brass, Copper, Alloy
export const metals = pgTable('metals', {
  id:           varchar('id',   { length: 36  }).primaryKey(),
  name:         varchar('name', { length: 100 }).notNull().unique(),
  isActive:     boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Stone Master ─────────────────────────────────────────────────────────────
// e.g. Diamond, Ruby, Emerald, Pearl, Kundan, Polki, American Diamond, No Stone
export const stones = pgTable('stones', {
  id:           varchar('id',   { length: 36  }).primaryKey(),
  name:         varchar('name', { length: 100 }).notNull().unique(),
  isActive:     boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Products ────────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id:           varchar('id',    { length: 36  }).primaryKey(),
  name:         varchar('name',  { length: 255 }).notNull(),
  slug:         varchar('slug',  { length: 255 }).notNull().unique(),
  sku:          varchar('sku',   { length: 100 }).notNull().unique(),

  // Categorization
  categoryId:   varchar('category_id',   { length: 36 }).references(() => categories.id),
  collectionId: varchar('collection_id', { length: 36 }).references(() => collections.id),

  // Jewelry-specific attributes
  metal:      varchar('metal',       { length: 100 }), // Gold | Silver | Rose Gold | Platinum | Brass | Copper
  purity:     varchar('purity',      { length: 50  }), // 18K | 22K | 24K | 925 | 999 | Gold Plated
  stone:      varchar('stone',       { length: 500 }), // comma-separated: "Diamond,Ruby"
  finish:     varchar('finish',      { length: 100 }), // Polished | Matte | Oxidized | Hammered | Antique
  look:       varchar('look',        { length: 100 }), // Ethnic | Modern | Bridal | Casual | Western | Traditional
  gender:     varchar('gender',      { length: 20  }).notNull().default('women'), // 'women' | 'men' | 'unisex'
  occasion:   varchar('occasion',    { length: 500 }), // comma-separated: "Wedding,Festival"
  isFeatured: boolean('is_featured').notNull().default(false),

  // Pricing
  price: integer('price').notNull(), // selling price in rupees
  mrp:   integer('mrp').notNull(),   // MRP in rupees

  // Inventory
  stock: integer('stock').notNull().default(0),
  sold:  integer('sold').notNull().default(0),

  // Ratings
  rating:      numeric('rating',       { precision: 3, scale: 2 }).notNull().default('0'),
  reviewCount: integer('review_count').notNull().default(0),

  // Status
  status: varchar('status', { length: 30 }).notNull().default('active'), // 'active' | 'draft' | 'out_of_stock'

  // Content
  description:      text('description'),
  careInstructions: text('care_instructions'),

  // Physical details
  weight:      numeric('weight',       { precision: 8, scale: 2 }), // in grams
  dimensions:  varchar('dimensions',   { length: 100 }),             // e.g. "2.5cm x 1.8cm"

  // Promotions
  tags:  text('tags'),              // comma-separated
  badge: varchar('badge', { length: 30 }), // 'new' | 'bestseller' | 'sale' | 'trending' | 'limited'

  // Media
  videoUrl:   varchar('video_url',   { length: 500 }),
  mediaOrder: varchar('media_order', { length: 20  }).default('image_first'), // 'image_first' | 'video_first'

  // SEO
  seoTitle:       varchar('seo_title',       { length: 255 }),
  seoDescription: varchar('seo_description', { length: 500 }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = pgTable('product_images', {
  id:           varchar('id',        { length: 36  }).primaryKey(),
  productId:    varchar('product_id',{ length: 36  }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl:     varchar('image_url', { length: 500 }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isMain:       boolean('is_main').notNull().default(false),
});

// ─── Product Variants (Color/Finish with stock) ───────────────────────────────
// e.g. Gold finish stock: 10, Silver finish stock: 5
export const productVariants = pgTable('product_variants', {
  id:        varchar('id',         { length: 36  }).primaryKey(),
  productId: varchar('product_id', { length: 36  }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  label:     varchar('label',      { length: 100 }).notNull(), // e.g. "Gold", "Silver", "Rose Gold"
  hexColor:  varchar('hex_color',  { length: 10  }),            // optional hex for swatch
  stock:     integer('stock').notNull().default(0),
});

// ─── Product Sizes (for rings, bangles) ──────────────────────────────────────
export const productSizes = pgTable('product_sizes', {
  id:        varchar('id',         { length: 36 }).primaryKey(),
  productId: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  size:      varchar('size',       { length: 20 }).notNull(), // e.g. "5", "6", "7", "Free Size", "2.4", "2.6"
  stock:     integer('stock').notNull().default(0),
});

// ─── Product FAQs ─────────────────────────────────────────────────────────────
export const productFaqs = pgTable('product_faqs', {
  id:           varchar('id',         { length: 36 }).primaryKey(),
  productId:    varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  question:     text('question').notNull(),
  answer:       text('answer').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Banners ─────────────────────────────────────────────────────────────────
export const banners = pgTable('banners', {
  id:           varchar('id',       { length: 36  }).primaryKey(),
  title:        varchar('title',    { length: 255 }).notNull(),
  subtitle:     varchar('subtitle', { length: 500 }),
  cta:          varchar('cta',      { length: 100 }),
  link:         varchar('link',     { length: 500 }),
  image:        varchar('image',    { length: 500 }),
  mobileImage:  varchar('mobile_image', { length: 500 }),
  position:     varchar('position', { length: 30 }).notNull().default('hero'), // 'hero' | 'mid' | 'category'
  isActive:     boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const coupons = pgTable('coupons', {
  id:        varchar('id',   { length: 36 }).primaryKey(),
  code:      varchar('code', { length: 50 }).notNull().unique(),
  type:      varchar('type', { length: 20 }).notNull(), // 'percent' | 'flat' | 'shipping'
  value:     integer('value').notNull(),
  minOrder:  integer('min_order').notNull().default(0),
  maxUses:   integer('max_uses').notNull().default(0),
  usedCount: integer('used_count').notNull().default(0),
  expiry:    date('expiry'),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Addresses ───────────────────────────────────────────────────────────────
export const addresses = pgTable('addresses', {
  id:        varchar('id',      { length: 36  }).primaryKey(),
  userId:    varchar('user_id', { length: 36  }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      varchar('name',    { length: 100 }).notNull(),
  phone:     varchar('phone',   { length: 20  }).notNull(),
  email:     varchar('email',   { length: 255 }),
  address:   text('address').notNull(),
  city:      varchar('city',    { length: 100 }).notNull(),
  pincode:   varchar('pincode', { length: 10  }).notNull(),
  state:     varchar('state',   { length: 100 }).notNull(),
  type:      varchar('type',    { length: 20  }).notNull().default('home'), // 'home' | 'work' | 'other'
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id:          varchar('id',           { length: 36  }).primaryKey(),
  orderNumber: varchar('order_number', { length: 50  }).notNull().unique(),
  userId:      varchar('user_id',      { length: 36  }).references(() => users.id),

  // Customer snapshot
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  email:        varchar('email',         { length: 255 }).notNull(),
  phone:        varchar('phone',         { length: 20  }).notNull(),
  addressLine:  text('address_line').notNull(),
  city:         varchar('city',    { length: 100 }).notNull(),
  pincode:      varchar('pincode', { length: 10  }).notNull(),
  state:        varchar('state',   { length: 100 }).notNull(),

  // Financials
  subtotal:       integer('subtotal').notNull(),
  shippingCost:   integer('shipping_cost').notNull().default(0),
  discountAmount: integer('discount_amount').notNull().default(0),
  total:          integer('total').notNull(),
  couponCode:     varchar('coupon_code', { length: 50 }),

  // Payment
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(), // 'upi' | 'card' | 'netbanking' | 'cod'
  paymentStatus: varchar('payment_status', { length: 30 }).notNull().default('pending'),
  status:        varchar('status',         { length: 30 }).notNull().default('processing'),

  // Razorpay
  razorpayOrderId:   varchar('razorpay_order_id',   { length: 100 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
  refundId:          varchar('refund_id',            { length: 100 }),
  refundAmount:      integer('refund_amount'),
  refundStatus:      varchar('refund_status',        { length: 30 }),

  // Shiprocket
  shiprocketOrderId:   varchar('shiprocket_order_id',   { length: 100 }),
  shiprocketShipmentId:varchar('shiprocket_shipment_id',{ length: 100 }),
  shiprocketAwbCode:   varchar('shiprocket_awb_code',   { length: 100 }),
  awbNumber:           varchar('awb_number',             { length: 100 }),
  courierPartner:      varchar('courier_partner',        { length: 100 }),
  shiprocketAttempt:   integer('shiprocket_attempt').notNull().default(0),

  notes:     text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable('order_items', {
  id:           varchar('id',            { length: 36  }).primaryKey(),
  orderId:      varchar('order_id',      { length: 36  }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId:    varchar('product_id',    { length: 36  }).references(() => products.id),
  productName:  varchar('product_name',  { length: 255 }).notNull(),
  productImage: varchar('product_image', { length: 500 }),
  sku:          varchar('sku',           { length: 100 }),
  price:        integer('price').notNull(),
  quantity:     integer('quantity').notNull(),
  variant:      varchar('variant', { length: 100 }), // color/finish variant label
  size:         varchar('size',    { length: 20  }), // ring/bangle size
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id:            varchar('id',             { length: 36  }).primaryKey(),
  userId:        varchar('user_id',        { length: 36  }).references(() => users.id),
  productId:     varchar('product_id',     { length: 36  }).references(() => products.id),
  customerName:  varchar('customer_name',  { length: 100 }).notNull(),
  reviewerImage: varchar('reviewer_image', { length: 500 }),
  rating:        integer('rating').notNull(), // 1–5
  comment:       text('comment'),
  status:        varchar('status',  { length: 20 }).notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  helpful:       integer('helpful').notNull().default(0),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
});

// ─── Wishlist Items ───────────────────────────────────────────────────────────
export const wishlistItems = pgTable('wishlist_items', {
  id:        varchar('id',         { length: 36 }).primaryKey(),
  userId:    varchar('user_id',    { length: 36 }).notNull().references(() => users.id,    { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcements = pgTable('announcements', {
  id:           varchar('id',   { length: 36  }).primaryKey(),
  text:         varchar('text', { length: 300 }).notNull(),
  emoji:        varchar('emoji',{ length: 10  }).default(''),
  isActive:     boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ─── Settings (KV store) ─────────────────────────────────────────────────────
export const settings = pgTable('settings', {
  id:        varchar('id',  { length: 36  }).primaryKey(),
  key:       varchar('key', { length: 100 }).notNull().unique(),
  value:     text('value'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Contact Messages ─────────────────────────────────────────────────────────
export const contactMessages = pgTable('contact_messages', {
  id:        varchar('id',      { length: 36  }).primaryKey(),
  name:      varchar('name',    { length: 100 }).notNull(),
  email:     varchar('email',   { length: 200 }).notNull(),
  phone:     varchar('phone',   { length: 20  }),
  subject:   varchar('subject', { length: 100 }).notNull(),
  message:   text('message').notNull(),
  status:    varchar('status',  { length: 20 }).notNull().default('unread'), // 'unread' | 'read' | 'replied'
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
