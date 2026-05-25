const mongoose = require('mongoose');
const Product = require('./src/models/product.model');
require('dotenv').config();

const mockProducts = [
  {
    title: "Apple iPhone 15 (Blue, 256 GB)",
    description: "The Apple iPhone 15 features a durable color-infused glass and aluminum design. It comes with the Dynamic Island, a 48MP Main camera, and USB-C.\n\nKey Features:\n- Dynamic Island bubbles up alerts and Live Activities\n- 48MP Main camera with 2x Telephoto\n- Durable color-infused glass and aluminum design\n- A16 Bionic chip powers all kinds of advanced features",
    price: { amount: 64900, currency: "INR" },
    originalPrice: 69900,
    category: "Mobiles",
    rating: 4.6,
    numReviews: 24514,
    images: [
      { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1000" }
    ],
    stock: 50
  },
  {
    title: "DIESEL Mr Daddy 2 Analog Watch",
    description: "Bold, ironic and never shy, Diesel doesn't follow trends; it creates them. A Diesel watch is the physical translation of the approach Diesel takes: a clashing of different languages and materials but with a strong mechanical touch.\n\nSpecifications:\n- Case size: 57mm; Band size: 28mm\n- Quartz movement with 4-time zone display\n- Water resistant up to 30m",
    price: { amount: 34993, currency: "INR" },
    originalPrice: 34995,
    category: "Fashion",
    rating: 4.6,
    numReviews: 27,
    images: [
      { url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000" }
    ],
    stock: 20
  },
  {
    title: "Nike Air Max 270 Black Red",
    description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh array of colors.\n\nBenefits:\n- Max Air 270 unit delivers unrivaled, all-day comfort\n- Woven and synthetic fabric on the upper provides a lightweight fit and airy feel\n- Foam midsole feels soft and comfortable",
    price: { amount: 12995, currency: "INR" },
    originalPrice: 19493,
    category: "Fashion",
    rating: 4.5,
    numReviews: 1245,
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000" }
    ],
    stock: 25
  },
  {
    title: "Sony Bravia 65-inch 4K Ultra HD TV",
    description: "Breathtaking 4K HDR pictures with natural color and contrast. Full Array LED for realistic brightness and deep blacks.\n\nFeatures:\n- 4K HDR Processor X1\n- TRILUMINOS Pro\n- Google TV with Google Assistant",
    price: { amount: 84990, currency: "INR" },
    originalPrice: 139900,
    category: "Electronics",
    rating: 4.8,
    numReviews: 15400,
    images: [
      { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?q=80&w=1000" }
    ],
    stock: 15
  },
  {
    title: "Keychron K2 Mechanical Keyboard",
    description: "Tactile mechanical typing. 84-key compact layout with RGB backlit keys. Bluetooth wireless or wired connectivity for Mac & Windows.\n\nSpecs:\n- Gateron G Pro Blue clicky switches\n- Rechargeable 4000mAh battery\n- Multi-device connectivity up to 3 devices",
    price: { amount: 6999, currency: "INR" },
    originalPrice: 8999,
    category: "Electronics",
    rating: 4.7,
    numReviews: 320,
    images: [
      { url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000" }
    ],
    stock: 18
  },
  {
    title: "Sony WH-1000XM5 ANC Headphones",
    description: "Industry leading active noise cancellation. 30-hour battery life with quick charging. Custom audio settings and smart voice features.\n\nSpecs:\n- Auto NC Optimizer adjusting to environment\n- Exceptional sound quality with high-res wireless audio\n- Crystal clear hands-free calling",
    price: { amount: 26990, currency: "INR" },
    originalPrice: 29990,
    category: "Electronics",
    rating: 4.8,
    numReviews: 1240,
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=1000" }
    ],
    stock: 30
  },
  {
    title: "Apple Watch Series 9 GPS (Midnight, 45mm)",
    description: "Double Tap guest gesture. S9 SiP processor for bright display. In-depth health features including blood oxygen monitoring, ECG, and heart rate sensor.\n\nSpecs:\n- 45mm Midnight Aluminum case\n- Always-On Retina LTPO OLED display\n- Water resistant up to 50 meters",
    price: { amount: 41900, currency: "INR" },
    originalPrice: 44900,
    category: "Electronics",
    rating: 4.7,
    numReviews: 1540,
    images: [
      { url: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000" }
    ],
    stock: 22
  },
  {
    title: "Ergohuman Elite Ergo Office Chair",
    description: "Full back support with dynamic lumbar adjustments. Ergonomically engineered black mesh. Adjust 4D armrests, headrests, and tilt locks easily.\n\nSpecs:\n- Premium breathable mesh cooling system\n- Solid aluminum reinforced wheel base\n- TUV certified pneumatic gas cylinder",
    price: { amount: 24500, currency: "INR" },
    originalPrice: 32000,
    category: "Home",
    rating: 4.6,
    numReviews: 89,
    images: [
      { url: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=1000" }
    ],
    stock: 10
  },
  {
    title: "Dyson V15 Detect Cordless Vacuum",
    description: "Dyson's most powerful, intelligent cordless vacuum. Laser reveals microscopic dust, counts and measures size of particles on screen.\n\nKey Specs:\n- Laser Slim Fluffy cleaner head reveals hidden dust\n- Digital Motorbar cleaner head adapts to all floor types\n- High torque cleaner head cleans deeply",
    price: { amount: 55900, currency: "INR" },
    originalPrice: 59900,
    category: "Appliances",
    rating: 4.7,
    numReviews: 530,
    images: [
      { url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000" }
    ],
    stock: 15
  },
  {
    title: "Nespresso Vertuo Next Coffee Machine",
    description: "Delivering the perfect cup of coffee from Espresso to a large Mug. Vertuo Next takes the full range of Nespresso coffee styles even further.\n\nFeatures:\n- Centrifusion technology gently and fully brews each capsule\n- Bluetooth and Wi-Fi enabled for automatic updates\n- One-touch brewing system with automatic capsule recognition",
    price: { amount: 16999, currency: "INR" },
    originalPrice: 19999,
    category: "Appliances",
    rating: 4.5,
    numReviews: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=1000" }
    ],
    stock: 12
  },
  {
    title: "Apple iPad Pro M4 (11-inch, 256GB)",
    description: "The thinnest Apple product ever, featuring the breakthrough Tandem OLED Ultra Retina XDR display, outrageous performance of M4 chip, and superfast 5G wireless.\n\nKey Features:\n- 11-inch Ultra Retina XDR display with Tandem OLED\n- Apple M4 chip with 9-core CPU and 10-core GPU\n- Pro camera system with LiDAR scanner and 12MP Landscape camera",
    price: { amount: 99900, currency: "INR" },
    originalPrice: 104900,
    category: "Electronics",
    rating: 4.9,
    numReviews: 830,
    images: [
      { url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?q=80&w=1000" }
    ],
    stock: 25
  },
  {
    title: "Premium Ceramic Coffee Mug & Coaster Set",
    description: "Handcrafted minimalist ceramic mug with matching wooden coaster. Durable stoneware designed for comfortable grip and excellent heat retention.\n\nSpecs:\n- Matte charcoal textured finish\n- 350ml capacity suitable for coffee or tea\n- Microwave and dishwasher safe",
    price: { amount: 1200, currency: "INR" },
    originalPrice: 1800,
    category: "Home",
    rating: 4.6,
    numReviews: 320,
    images: [
      { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000" }
    ],
    stock: 45
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for seeding...");

    const sellerId = "60d5ecb8b4877716a8c51234"; 
    await Product.deleteMany({});
    
    const productsWithSeller = mockProducts.map(p => ({ ...p, seller: sellerId }));
    await Product.insertMany(productsWithSeller);

    console.log("Mock products with multiple images seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
