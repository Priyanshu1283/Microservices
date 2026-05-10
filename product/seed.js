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
    numReviews: 245144,
    images: [
      { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&blur=10" },
      { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&grayscale" }
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
      { url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&sepia=10" },
      { url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&brightness=50" }
    ],
    stock: 20
  },
  {
    title: "Nike Air Max 270",
    description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh array of colors.\n\nBenefits:\n- Max Air 270 unit delivers unrivaled, all-day comfort\n- Woven and synthetic fabric on the upper provides a lightweight fit and airy feel\n- Foam midsole feels soft and comfortable",
    price: { amount: 12995, currency: "INR" },
    originalPrice: 19493,
    category: "Fashion",
    rating: 4.5,
    numReviews: 1245,
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&hue=50" },
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&invert=true" }
    ],
    stock: 25
  },
  {
    title: "Sony Bravia 65-inch 4K TV",
    description: "Breathtaking 4K HDR pictures with natural color and contrast. Full Array LED for realistic brightness and deep blacks.\n\nFeatures:\n- 4K HDR Processor X1\n- TRILUMINOS Pro\n- Google TV with Google Assistant",
    price: { amount: 84990, currency: "INR" },
    originalPrice: 139900,
    category: "Electronics",
    rating: 4.8,
    numReviews: 15400,
    images: [
      { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000" },
      { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000&auto=format&blur=20" },
      { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000&auto=format&contrast=20" }
    ],
    stock: 15
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
