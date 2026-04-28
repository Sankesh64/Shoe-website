const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const productData = [
  {
    name: 'Air Max Pulse Roebuck',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', alt: 'Air Max Pulse' }],
    brand: 'RoeBook',
    category: 'men',
    description: 'The Air Max Pulse combines premium materials with revolutionary cushioning for elite comfort.',
    price: 159.99,
    rating: 4.5,
    numReviews: 2,
    gender: 'men',
    sizes: [{ size: '8', stock: 10 }, { size: '9', stock: 10 }, { size: '10', stock: 10 }],
    colors: [{ name: 'Red', hex: '#FF0000' }, { name: 'Black', hex: '#000000' }]
  },
  {
    name: 'Metcon 9 Elite',
    images: [{ url: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329', alt: 'Metcon 9' }],
    brand: 'RoeBook',
    category: 'men',
    description: 'Designed for serious athletes, the Metcon 9 provides unmatched stability and durability.',
    price: 139.99,
    rating: 5,
    numReviews: 1,
    gender: 'men',
    sizes: [{ size: '7', stock: 5 }, { size: '8', stock: 5 }, { size: '9', stock: 5 }],
    colors: [{ name: 'Blue', hex: '#0000FF' }, { name: 'White', hex: '#FFFFFF' }]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected for seeding...');

    await User.deleteMany();
    await Product.deleteMany();

    // Create Admin
    const admin = new User({
      fullName: 'Admin User',
      email: 'admin@roebook.com',
      password: 'Admin123',
      role: 'admin'
    });
    await admin.save();

    // Create Regular User
    const user = new User({
      fullName: 'Regular User',
      email: 'user@roebook.com',
      password: 'User123',
      role: 'user'
    });
    await user.save();

    console.log('Users created...');

    for (const p of productData) {
      const product = new Product({
        ...p,
        user: admin._id,
        reviews: [
          {
            user: user._id,
            name: user.fullName,
            rating: 5,
            comment: 'Absolutely stunning shoes! Best purchase this year.'
          }
        ]
      });
      await product.save();
    }

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
