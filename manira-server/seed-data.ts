import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './src/db';
import {
  categories, collections, products, productImages, productVariants,
  productSizes, banners, announcements, settings, adminUsers,
} from './src/db/schema';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

// ─── Unsplash imitation jewellery images ────────────────────────────────────
const IMG = {
  necklace1: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
  necklace2: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop',
  necklace3: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=800&fit=crop',
  earring1:  'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=600&h=800&fit=crop',
  earring2:  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=800&fit=crop',
  earring3:  'https://images.unsplash.com/photo-1573408301185-9519f94815f2?w=600&h=800&fit=crop',
  ring1:     'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop',
  ring2:     'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=800&fit=crop',
  bangle1:   'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
  bangle2:   'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=600&h=800&fit=crop',
  bracelet1: 'https://images.unsplash.com/photo-1573408301185-9519f94815f2?w=600&h=800&fit=crop',
  pendant1:  'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=600&h=800&fit=crop',
  set1:      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
  set2:      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=800&fit=crop',
  men1:      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
  hero1:     'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&h=600&fit=crop',
  hero2:     'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1400&h=600&fit=crop',
  hero3:     'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1400&h=600&fit=crop',
  col1:      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=450&fit=crop',
  col2:      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=450&fit=crop',
  col3:      'https://images.unsplash.com/photo-1573408301185-9519f94815f2?w=600&h=450&fit=crop',
  col4:      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=450&fit=crop',
};

async function seed() {
  console.log('\n🌱 Seeding Manira database...\n');

  // ── Admin User ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await db.insert(adminUsers).values({
    id: uuid(), name: 'Manira Admin', email: 'admin@manira.in',
    passwordHash, role: 'super_admin', isActive: true,
  }).onConflictDoNothing();
  console.log('✅ Admin user: admin@manira.in / Admin@123');

  // ── Announcements ──────────────────────────────────────────────────────────
  const announcementData = [
    { id: uuid(), text: 'Free Shipping on orders above ₹999', emoji: '🚚', isActive: true, displayOrder: 1 },
    { id: uuid(), text: 'Trendy Imitation Jewellery for Women & Men', emoji: '✨', isActive: true, displayOrder: 2 },
    { id: uuid(), text: 'Use code MANIRA10 for Extra 10% off', emoji: '🎁', isActive: true, displayOrder: 3 },
    { id: uuid(), text: '15-Day Easy Returns on all orders', emoji: '↩️', isActive: true, displayOrder: 4 },
  ];
  await db.insert(announcements).values(announcementData).onConflictDoNothing();
  console.log('✅ Announcements seeded');

  // ── Settings ───────────────────────────────────────────────────────────────
  const settingsData = [
    { id: uuid(), key: 'storeName',      value: 'Manira Jewels' },
    { id: uuid(), key: 'storeEmail',     value: 'hello@manira.in' },
    { id: uuid(), key: 'storePhone',     value: '+91 98765 43210' },
    { id: uuid(), key: 'freeShippingMin',value: '999' },
    { id: uuid(), key: 'shippingCharge', value: '79' },
    { id: uuid(), key: 'currency',       value: 'INR' },
  ];
  await db.insert(settings).values(settingsData).onConflictDoNothing();
  console.log('✅ Settings seeded');

  // ── Banners ────────────────────────────────────────────────────────────────
  const bannerData = [
    {
      id: uuid(), title: 'New Bridal Collection 2025', subtitle: 'Bridal Edit',
      cta: 'Shop Now', link: '/products?gender=women',
      image: IMG.hero1, position: 'hero', isActive: true, displayOrder: 1,
    },
    {
      id: uuid(), title: 'Festive Jewellery Has Arrived', subtitle: 'Festive Season',
      cta: 'Explore Now', link: '/products?badge=new',
      image: IMG.hero2, position: 'hero', isActive: true, displayOrder: 2,
    },
    {
      id: uuid(), title: 'Men\'s Collection — Bold & Modern', subtitle: 'For Him',
      cta: 'Shop Men', link: '/products?gender=men',
      image: IMG.hero3, position: 'hero', isActive: true, displayOrder: 3,
    },
  ];
  await db.insert(banners).values(bannerData).onConflictDoNothing();
  console.log('✅ Banners seeded');

  // ── Categories ─────────────────────────────────────────────────────────────
  const catData = [
    { id: uuid(), name: 'Necklaces',    slug: 'necklaces',    icon: '📿', image: IMG.necklace1, displayOrder: 1 },
    { id: uuid(), name: 'Earrings',     slug: 'earrings',     icon: '✨', image: IMG.earring1,  displayOrder: 2 },
    { id: uuid(), name: 'Rings',        slug: 'rings',        icon: '💍', image: IMG.ring1,     displayOrder: 3 },
    { id: uuid(), name: 'Bangles',      slug: 'bangles',      icon: '🔮', image: IMG.bangle1,   displayOrder: 4 },
    { id: uuid(), name: 'Bracelets',    slug: 'bracelets',    icon: '🌸', image: IMG.bracelet1, displayOrder: 5 },
    { id: uuid(), name: 'Mangalsutra',  slug: 'mangalsutra',  icon: '🪙', image: IMG.necklace2, displayOrder: 6 },
    { id: uuid(), name: 'Maang Tikka',  slug: 'maang-tikka',  icon: '👑', image: IMG.set1,      displayOrder: 7 },
    { id: uuid(), name: 'Pendants',     slug: 'pendants',     icon: '⭐', image: IMG.pendant1,  displayOrder: 8 },
  ];
  await db.insert(categories).values(catData.map(c => ({ ...c, isActive: true, productCount: 0 }))).onConflictDoNothing();
  console.log('✅ Categories seeded');

  const catMap = Object.fromEntries(catData.map(c => [c.slug, c.id]));

  // ── Collections ────────────────────────────────────────────────────────────
  const colData = [
    { id: uuid(), name: 'Bridal Edit',        slug: 'bridal-edit',        image: IMG.col1, displayOrder: 1, description: 'Complete bridal jewellery sets for your special day' },
    { id: uuid(), name: 'Festive Collection', slug: 'festive-collection', image: IMG.col2, displayOrder: 2, description: 'Celebrate every festival with sparkling imitation jewellery' },
    { id: uuid(), name: 'Daily Wear',         slug: 'daily-wear',         image: IMG.col3, displayOrder: 3, description: 'Lightweight & comfortable pieces for everyday styling' },
    { id: uuid(), name: 'Office Glam',        slug: 'office-glam',        image: IMG.col4, displayOrder: 4, description: 'Subtle & sophisticated pieces for the working woman' },
  ];
  await db.insert(collections).values(colData.map(c => ({ ...c, isActive: true, productCount: 0 }))).onConflictDoNothing();
  console.log('✅ Collections seeded');

  const colMap = Object.fromEntries(colData.map(c => [c.slug, c.id]));

  // ── Products ───────────────────────────────────────────────────────────────
  const productsData = [
    // ── Earrings ──
    {
      id: uuid(), name: 'Kundan Jhumka Earrings', slug: 'kundan-jhumka-earrings', sku: 'MNR-EAR-001',
      categoryId: catMap['earrings'], collectionId: colMap['bridal-edit'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Ethnic',
      gender: 'women', occasion: 'Wedding,Festival,Party',
      price: 399, mrp: 799, stock: 50, sold: 120,
      rating: '4.50', reviewCount: 48, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Elegant Kundan jhumka earrings with intricate antique gold finish. Perfect for weddings, festivals and ethnic occasions.',
      tags: 'kundan,jhumka,bridal,ethnic,antique',
      images: [IMG.earring1, IMG.earring2],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }, { label: 'Silver Tone', hexColor: '#C0C0C0' }],
    },
    {
      id: uuid(), name: 'Pearl Drop Chandbali Earrings', slug: 'pearl-drop-chandbali-earrings', sku: 'MNR-EAR-002',
      categoryId: catMap['earrings'], collectionId: colMap['festive-collection'],
      metal: 'Rose Gold Tone', finish: 'Polished', look: 'Ethnic',
      gender: 'women', occasion: 'Festival,Party,Casual',
      price: 299, mrp: 599, stock: 80, sold: 95,
      rating: '4.30', reviewCount: 36, status: 'active',
      badge: 'new', isFeatured: true,
      description: 'Charming chandbali earrings with faux pearl drops. A timeless piece that elevates any ethnic ensemble.',
      tags: 'chandbali,pearl,festive,ethnic',
      images: [IMG.earring2, IMG.earring3],
      variants: [{ label: 'Rose Gold', hexColor: '#E8A0A0' }, { label: 'Antique Gold', hexColor: '#B8860B' }],
    },
    {
      id: uuid(), name: 'Oxidised Silver Tribal Earrings', slug: 'oxidised-silver-tribal-earrings', sku: 'MNR-EAR-003',
      categoryId: catMap['earrings'], collectionId: colMap['daily-wear'],
      metal: 'Oxidised Silver', finish: 'Oxidized', look: 'Ethnic',
      gender: 'women', occasion: 'Casual,College,Daily',
      price: 199, mrp: 399, stock: 100, sold: 78,
      rating: '4.20', reviewCount: 29, status: 'active',
      badge: 'new', isFeatured: false,
      description: 'Bold oxidised tribal earrings with unique handcrafted design. Lightweight and comfortable for daily wear.',
      tags: 'oxidised,tribal,boho,daily',
      images: [IMG.earring3, IMG.earring1],
      variants: [{ label: 'Oxidised Silver', hexColor: '#8B7355' }],
    },
    // ── Necklaces ──
    {
      id: uuid(), name: 'Layered Kundan Necklace Set', slug: 'layered-kundan-necklace-set', sku: 'MNR-NCK-001',
      categoryId: catMap['necklaces'], collectionId: colMap['bridal-edit'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Bridal',
      gender: 'women', occasion: 'Wedding,Engagement,Festival',
      price: 899, mrp: 1799, stock: 30, sold: 210,
      rating: '4.70', reviewCount: 87, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Stunning multi-layered Kundan necklace set with matching earrings. The perfect bridal jewellery set for your special day.',
      tags: 'kundan,bridal,necklace,set,layered',
      images: [IMG.necklace1, IMG.set1],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }],
    },
    {
      id: uuid(), name: 'Meenakari Choker Necklace', slug: 'meenakari-choker-necklace', sku: 'MNR-NCK-002',
      categoryId: catMap['necklaces'], collectionId: colMap['festive-collection'],
      metal: 'Antique Gold', finish: 'Meenakari', look: 'Ethnic',
      gender: 'women', occasion: 'Festival,Pooja,Party',
      price: 649, mrp: 1299, stock: 45, sold: 145,
      rating: '4.60', reviewCount: 62, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Vibrant meenakari choker necklace with colourful enamel work. A true celebration of Indian craft.',
      tags: 'meenakari,choker,colorful,ethnic,festive',
      images: [IMG.necklace2, IMG.necklace3],
      variants: [{ label: 'Red Meenakari', hexColor: '#DC2626' }, { label: 'Green Meenakari', hexColor: '#16A34A' }, { label: 'Blue Meenakari', hexColor: '#2563EB' }],
    },
    {
      id: uuid(), name: 'Delicate Pearl Chain Necklace', slug: 'delicate-pearl-chain-necklace', sku: 'MNR-NCK-003',
      categoryId: catMap['necklaces'], collectionId: colMap['office-glam'],
      metal: 'Silver Tone', finish: 'Polished', look: 'Modern',
      gender: 'women', occasion: 'Office,Casual,Daily',
      price: 349, mrp: 699, stock: 70, sold: 89,
      rating: '4.10', reviewCount: 34, status: 'active',
      badge: 'new', isFeatured: true,
      description: 'Minimalist faux pearl chain necklace, perfect for office wear and casual outings. Pairs beautifully with western and ethnic wear.',
      tags: 'pearl,minimal,office,chain',
      images: [IMG.necklace3, IMG.pendant1],
      variants: [{ label: 'Silver Tone', hexColor: '#C0C0C0' }, { label: 'Rose Gold', hexColor: '#E8A0A0' }],
    },
    // ── Bangles ──
    {
      id: uuid(), name: 'Antique Gold Kada Bangle Set', slug: 'antique-gold-kada-bangle-set', sku: 'MNR-BNG-001',
      categoryId: catMap['bangles'], collectionId: colMap['bridal-edit'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Bridal',
      gender: 'women', occasion: 'Wedding,Festival,Pooja',
      price: 549, mrp: 1099, stock: 40, sold: 175,
      rating: '4.50', reviewCount: 71, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Set of 4 intricately designed antique gold finish kada bangles. Ideal for bridal and festive occasions.',
      tags: 'kada,bangle,bridal,antique,set',
      images: [IMG.bangle1, IMG.bangle2],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }],
      sizes: ['2.4', '2.6', '2.8'],
    },
    {
      id: uuid(), name: 'Oxidised Floral Bangle Set of 6', slug: 'oxidised-floral-bangle-set', sku: 'MNR-BNG-002',
      categoryId: catMap['bangles'], collectionId: colMap['daily-wear'],
      metal: 'Oxidised Silver', finish: 'Oxidized', look: 'Ethnic',
      gender: 'women', occasion: 'Casual,Festival,Daily',
      price: 299, mrp: 599, stock: 90, sold: 134,
      rating: '4.40', reviewCount: 53, status: 'active',
      badge: 'new', isFeatured: false,
      description: 'Stunning set of 6 oxidised floral pattern bangles with vintage charm.',
      tags: 'oxidised,floral,bangle,set,daily',
      images: [IMG.bangle2, IMG.bangle1],
      variants: [{ label: 'Oxidised Silver', hexColor: '#8B7355' }],
      sizes: ['2.4', '2.6', '2.8'],
    },
    // ── Rings ──
    {
      id: uuid(), name: 'Adjustable Kundan Finger Ring', slug: 'adjustable-kundan-finger-ring', sku: 'MNR-RNG-001',
      categoryId: catMap['rings'], collectionId: colMap['festive-collection'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Ethnic',
      gender: 'women', occasion: 'Festival,Party,Casual',
      price: 199, mrp: 399, stock: 150, sold: 98,
      rating: '4.20', reviewCount: 42, status: 'active',
      badge: 'new', isFeatured: false,
      description: 'Adjustable kundan finger ring with intricate stone work. One size fits all design.',
      tags: 'kundan,ring,adjustable,ethnic',
      images: [IMG.ring1, IMG.ring2],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }, { label: 'Rose Gold', hexColor: '#E8A0A0' }],
      sizes: ['Free Size'],
    },
    {
      id: uuid(), name: 'Oxidised Statement Toe Ring', slug: 'oxidised-statement-toe-ring', sku: 'MNR-RNG-002',
      categoryId: catMap['rings'], collectionId: colMap['daily-wear'],
      metal: 'Oxidised Silver', finish: 'Oxidized', look: 'Ethnic',
      gender: 'women', occasion: 'Casual,Daily,Beach',
      price: 149, mrp: 299, stock: 200, sold: 67,
      rating: '4.00', reviewCount: 28, status: 'active',
      badge: null, isFeatured: false,
      description: 'Traditional oxidised silver toe ring with adjustable closure. Perfect for ethnic and boho looks.',
      tags: 'toe-ring,oxidised,boho,ethnic',
      images: [IMG.ring2, IMG.ring1],
      variants: [{ label: 'Oxidised Silver', hexColor: '#8B7355' }],
      sizes: ['Free Size'],
    },
    // ── Mangalsutra ──
    {
      id: uuid(), name: 'Daily Wear Black Bead Mangalsutra', slug: 'daily-wear-black-bead-mangalsutra', sku: 'MNR-MNG-001',
      categoryId: catMap['mangalsutra'], collectionId: colMap['daily-wear'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Traditional',
      gender: 'women', occasion: 'Daily,Casual,Pooja',
      price: 449, mrp: 899, stock: 60, sold: 203,
      rating: '4.60', reviewCount: 94, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Lightweight daily wear mangalsutra with black beads and heart pendant. Elegant and comfortable for all-day wear.',
      tags: 'mangalsutra,daily,lightweight,heart',
      images: [IMG.necklace2, IMG.necklace3],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }],
    },
    // ── Bracelets ──
    {
      id: uuid(), name: 'Rose Gold Charm Bracelet', slug: 'rose-gold-charm-bracelet', sku: 'MNR-BRC-001',
      categoryId: catMap['bracelets'], collectionId: colMap['office-glam'],
      metal: 'Rose Gold Tone', finish: 'Polished', look: 'Modern',
      gender: 'women', occasion: 'Casual,Office,Daily',
      price: 249, mrp: 499, stock: 85, sold: 112,
      rating: '4.30', reviewCount: 45, status: 'active',
      badge: 'new', isFeatured: true,
      description: 'Delicate rose gold charm bracelet with star and moon charms. Pairs perfectly with any outfit.',
      tags: 'rose-gold,charm,bracelet,minimal',
      images: [IMG.bracelet1, IMG.earring2],
      variants: [{ label: 'Rose Gold', hexColor: '#E8A0A0' }, { label: 'Silver Tone', hexColor: '#C0C0C0' }],
    },
    // ── Maang Tikka ──
    {
      id: uuid(), name: 'Bridal Kundan Maang Tikka', slug: 'bridal-kundan-maang-tikka', sku: 'MNR-MTK-001',
      categoryId: catMap['maang-tikka'], collectionId: colMap['bridal-edit'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Bridal',
      gender: 'women', occasion: 'Wedding,Engagement,Festival',
      price: 599, mrp: 1199, stock: 35, sold: 88,
      rating: '4.70', reviewCount: 39, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Stunning bridal kundan maang tikka with long chain drop. The centrepiece of any bridal look.',
      tags: 'maang-tikka,bridal,kundan,wedding',
      images: [IMG.set1, IMG.set2],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }],
    },
    // ── Men ──
    {
      id: uuid(), name: 'Men\'s Black Oxidised Chain Bracelet', slug: 'mens-black-oxidised-chain-bracelet', sku: 'MNR-MEN-001',
      categoryId: catMap['bracelets'], collectionId: colMap['daily-wear'],
      metal: 'Oxidised Silver', finish: 'Oxidized', look: 'Modern',
      gender: 'men', occasion: 'Casual,Daily,Party',
      price: 299, mrp: 599, stock: 75, sold: 56,
      rating: '4.20', reviewCount: 24, status: 'active',
      badge: 'new', isFeatured: true,
      description: 'Bold oxidised chain bracelet for men. Adds an edgy yet stylish touch to any outfit.',
      tags: 'men,bracelet,oxidised,chain,bold',
      images: [IMG.men1, IMG.bracelet1],
      variants: [{ label: 'Oxidised Black', hexColor: '#1a1a1a' }, { label: 'Silver Tone', hexColor: '#C0C0C0' }],
    },
    {
      id: uuid(), name: 'Men\'s Silver Stainless Chain Necklace', slug: 'mens-silver-chain-necklace', sku: 'MNR-MEN-002',
      categoryId: catMap['necklaces'], collectionId: colMap['daily-wear'],
      metal: 'Silver Tone', finish: 'Polished', look: 'Modern',
      gender: 'men', occasion: 'Casual,Daily,Party',
      price: 349, mrp: 699, stock: 65, sold: 43,
      rating: '4.10', reviewCount: 19, status: 'active',
      badge: null, isFeatured: false,
      description: 'Classic silver tone chain necklace for men. Versatile and durable for everyday wear.',
      tags: 'men,chain,silver,necklace,daily',
      images: [IMG.necklace3, IMG.men1],
      variants: [{ label: 'Silver Tone', hexColor: '#C0C0C0' }, { label: 'Black Tone', hexColor: '#1a1a1a' }],
    },
    // ── Pendants ──
    {
      id: uuid(), name: 'Om Gold Pendant with Chain', slug: 'om-gold-pendant-with-chain', sku: 'MNR-PND-001',
      categoryId: catMap['pendants'], collectionId: colMap['daily-wear'],
      metal: 'Antique Gold', finish: 'Antique', look: 'Traditional',
      gender: 'men', occasion: 'Daily,Pooja,Casual',
      price: 279, mrp: 549, stock: 90, sold: 134,
      rating: '4.50', reviewCount: 58, status: 'active',
      badge: 'bestseller', isFeatured: true,
      description: 'Divine Om pendant with antique gold finish chain. A spiritual accessory for daily wear.',
      tags: 'om,pendant,chain,spiritual,men',
      images: [IMG.pendant1, IMG.necklace2],
      variants: [{ label: 'Antique Gold', hexColor: '#B8860B' }],
    },
  ];

  for (const p of productsData) {
    const { images, variants, sizes, ...productFields } = p;
    const discount = Math.round(((productFields.mrp - productFields.price) / productFields.mrp) * 100);

    await db.insert(products).values({
      ...productFields,
      weight: '0.05',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing();

    // Images
    if (images?.length) {
      await db.insert(productImages).values(
        images.map((url, i) => ({
          id: uuid(), productId: productFields.id,
          imageUrl: url, displayOrder: i, isMain: i === 0,
        }))
      ).onConflictDoNothing();
    }

    // Variants
    if (variants?.length) {
      await db.insert(productVariants).values(
        variants.map(v => ({
          id: uuid(), productId: productFields.id,
          label: v.label, hexColor: v.hexColor,
          stock: Math.floor(productFields.stock / variants.length),
        }))
      ).onConflictDoNothing();
    }

    // Sizes
    if (sizes?.length) {
      await db.insert(productSizes).values(
        sizes.map(s => ({
          id: uuid(), productId: productFields.id,
          size: s, stock: Math.floor(productFields.stock / sizes.length),
        }))
      ).onConflictDoNothing();
    }
  }
  console.log(`✅ ${productsData.length} products seeded with images, variants & sizes`);

  console.log('\n🎉 All done! Visit:');
  console.log('   🌐 Web:   http://localhost:3000');
  console.log('   ⚙️  Admin: http://localhost:3001  (admin@manira.in / Admin@123)');
  console.log('   🖥️  API:   http://localhost:5000\n');

  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
