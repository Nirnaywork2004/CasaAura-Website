import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from '../models/Product';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const sampleProducts = [
  {
    name: 'Aura Sculpted Terracotta Vase',
    description: 'Handcrafted stoneware vase with organic rippled texture and matte earthen glaze. Perfect as a standalone sculptural accent or paired with dried botanical stems.',
    category: 'ceramics',
    price: 2499,
    originalPrice: 3199,
    discount: 22,
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.8,
    reviews: 42,
    colors: [
      { name: 'Warm Terracotta', hex: '#B86F52' },
      { name: 'Raw Sandstone', hex: '#D6C7B2' },
      { name: 'Charcoal Black', hex: '#2B2B2B' },
    ],
    material: 'Natural Terracotta & Ceramic Glaze',
    stock: 24,
    featured: true,
    bestseller: true,
    newArrival: false,
  },
  {
    name: 'Solis Fluted Brass Table Lamp',
    description: 'Architectural table lamp featuring a solid brushed brass pedestal, weighted marble base, and an opal glass orb that diffuses soft, ambient illumination.',
    category: 'lighting',
    price: 5499,
    originalPrice: 6999,
    discount: 21,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.9,
    reviews: 29,
    colors: [
      { name: 'Brushed Brass', hex: '#D4AF37' },
      { name: 'Antique Bronze', hex: '#6E4D25' },
    ],
    material: 'Spun Brass & Opal Frosted Glass',
    stock: 15,
    featured: true,
    bestseller: false,
    newArrival: true,
  },
  {
    name: 'Zenith Organic Linen Cushion Cover',
    description: 'Textured washed French flax linen pillow cover with frayed fringed edges and hidden brass zipper. Pre-washed for cloud-like softness.',
    category: 'cushions',
    price: 1299,
    originalPrice: 1699,
    discount: 24,
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.7,
    reviews: 63,
    colors: [
      { name: 'Oatmeal Natural', hex: '#DDD0C0' },
      { name: 'Sage Moss', hex: '#9BA88D' },
      { name: 'Dusk Clay', hex: '#C08A75' },
    ],
    material: '100% Pure Stonewashed Flax Linen',
    stock: 40,
    featured: false,
    bestseller: true,
    newArrival: false,
  },
  {
    name: 'Kanso Minimalist Arched Wall Mirror',
    description: 'Full-length floor and wall-leaning arched mirror encased in seamless iron tubing. Adds dimensional depth and natural light to entryways and living rooms.',
    category: 'mirrors',
    price: 8499,
    originalPrice: 10499,
    discount: 19,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.9,
    reviews: 38,
    colors: [
      { name: 'Matte Jet Black', hex: '#1C1C1C' },
      { name: 'Warm Gold Leaf', hex: '#CBA135' },
    ],
    material: 'HD Distortion-Free Glass & Anodized Metal Frame',
    stock: 10,
    featured: true,
    bestseller: true,
    newArrival: false,
  },
  {
    name: 'Dune Handwoven Wool & Jute Area Rug',
    description: 'Subtle high-low loop pile rug blending renewable New Zealand wool with unbleached organic jute yarns for a grounded, tactile foundation underfoot.',
    category: 'rugs',
    price: 7999,
    originalPrice: 9999,
    discount: 20,
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.8,
    reviews: 19,
    colors: [
      { name: 'Natural Khaki', hex: '#C2B69D' },
      { name: 'Ivory Sand', hex: '#EAE5D9' },
    ],
    material: '70% New Zealand Wool, 30% Golden Jute',
    stock: 8,
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: 'Terra Fired Ceramic Planter with Acacia Stand',
    description: 'Indoor breathable ceramic cylinder planter featuring drainage plug and accompanied by a water-sealed solid acacia wood tripod elevation stand.',
    category: 'plants',
    price: 2899,
    originalPrice: 3499,
    discount: 17,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.6,
    reviews: 51,
    colors: [
      { name: 'Chalk White', hex: '#F4F2EC' },
      { name: 'Forest Olive', hex: '#586249' },
    ],
    material: 'High-fire Glazed Earthenware & Acacia Wood',
    stock: 22,
    featured: false,
    bestseller: true,
    newArrival: false,
  },
  {
    name: 'Astrid Abstract Canvas Wall Art Diptych',
    description: 'Set of two framed textured acrylic works on gallery-wrapped canvas depicting minimalist geo-organic forms in earth-toned pigment washes.',
    category: 'wall-art',
    price: 4999,
    originalPrice: 6299,
    discount: 21,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.8,
    reviews: 14,
    colors: [
      { name: 'Ochre & Sepia', hex: '#9E7246' },
      { name: 'Monochrome Slate', hex: '#63676C' },
    ],
    material: 'Heavyweight Cotton Canvas & Natural Ash Frame',
    stock: 12,
    featured: true,
    bestseller: false,
    newArrival: true,
  },
  {
    name: 'Vesta Marble & Fluted Wood Decorative Tray',
    description: 'Polished Banswara white marble catchall tray rimmed with solid mango wood fluting. Perfect for coffee table styling, perfumes, or jewelry.',
    category: 'decor',
    price: 1899,
    originalPrice: 2499,
    discount: 24,
    images: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.9,
    reviews: 47,
    colors: [
      { name: 'White Marble & Walnut', hex: '#ECE8DF' },
      { name: 'Green Marble & Natural Oak', hex: '#3E4D43' },
    ],
    material: 'Solid Indian Banswara Marble & Mango Wood',
    stock: 35,
    featured: false,
    bestseller: true,
    newArrival: false,
  },
  {
    name: 'Norden Woven Rattan Dome Pendant Light',
    description: 'Open-weave organic cane rattan pendant fixture that casts intricate botanical shadows across ceiling and dining spaces when illuminated.',
    category: 'lighting',
    price: 3699,
    originalPrice: 4599,
    discount: 20,
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.7,
    reviews: 23,
    colors: [
      { name: 'Natural Cane', hex: '#D7BC8D' },
      { name: 'Toasted Amber', hex: '#A87948' },
    ],
    material: 'Natural Indonesian Cane Rattan & Hemp Cord',
    stock: 18,
    featured: true,
    bestseller: false,
    newArrival: false,
  },
  {
    name: 'Solstice Ceramic Ribbed Matcha Bowl & Candle',
    description: 'Hand-thrown ribbed ceramic bowl containing 100% natural soy wax scented with cedarwood, crushed cardamon, and white amber. Vessel is reusable after burn.',
    category: 'decor',
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.8,
    reviews: 55,
    colors: [
      { name: 'Speckled Cream', hex: '#EBE7DC' },
      { name: 'Smoked Amber', hex: '#7C5835' },
    ],
    material: 'Stoneware Ceramic & Clean Soy Wax',
    stock: 50,
    featured: false,
    bestseller: true,
    newArrival: true,
  },
  {
    name: 'Elysian Bouclé Swivel Accent Chair',
    description: 'Curved sculptural accent armchair upholstered in heavyweight ivory textured bouclé with a hidden 360-degree silent brushed steel swivel mechanism.',
    category: 'decor',
    price: 18999,
    originalPrice: 23999,
    discount: 21,
    images: [
      'https://images.unsplash.com/photo-1580481077114-1e7a502c38cb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 5.0,
    reviews: 12,
    colors: [
      { name: 'Alabaster Bouclé', hex: '#F5F2EB' },
      { name: 'Warm Taupe Bouclé', hex: '#B8AFA6' },
    ],
    material: 'Heavyweight Wool Blend Bouclé & Solid Pine Frame',
    stock: 5,
    featured: true,
    bestseller: false,
    newArrival: true,
  },
  {
    name: 'Mira Brass Wall Sconce with Ribbed Glass',
    description: 'Modern art deco inspired wall sconce with fluted cylindrical borosilicate glass and spun unlacquered brass hardware.',
    category: 'lighting',
    price: 3299,
    originalPrice: 4199,
    discount: 21,
    images: [
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
    ],
    rating: 4.8,
    reviews: 31,
    colors: [
      { name: 'Brushed Brass', hex: '#D4AF37' },
      { name: 'Matte Gunmetal', hex: '#2F3136' },
    ],
    material: 'Solid Brass & Ribbed Borosilicate Glass',
    stock: 20,
    featured: false,
    bestseller: true,
    newArrival: false,
  }
];

export async function runSeed(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    console.error('\n❌ [MongoDB Seed] MONGODB_URI is not set or contains placeholders.');
    console.info('ℹ️  Please set MONGODB_URI in your .env file before running seed.\n');
    process.exit(1);
  }

  try {
    console.log(`\n⏳ [MongoDB Seed] Connecting to database: ${uri.replace(/\/\/.*@/, '//****:****@')}...`);
    await mongoose.connect(uri);
    console.log('✅ [MongoDB Seed] Connected successfully.');

    console.log('🧹 [MongoDB Seed] Clearing existing product records...');
    const deleted = await Product.deleteMany({});
    console.log(`ℹ️  [MongoDB Seed] Removed ${deleted.deletedCount} existing products.`);

    console.log(`🌱 [MongoDB Seed] Seeding ${sampleProducts.length} CasaAura products with INR pricing...`);
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`\n🎉 [MongoDB Seed] Successfully created ${inserted.length} products:`);
    inserted.forEach((prod, idx) => {
      console.log(`   ${idx + 1}. [${prod.category.toUpperCase()}] ${prod.name} - ₹${prod.price} (ID: ${prod._id})`);
    });

    console.log('\n✨ Database seeding completed successfully!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ [MongoDB Seed] Error during seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}
