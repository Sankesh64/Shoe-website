const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  syncCart,
  syncWishlist,
  getUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.route('/profile').get(protect, getUserProfile);
router.route('/cart').post(protect, syncCart);
router.route('/wishlist').post(protect, syncWishlist);

// Admin routes
router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);
router.route('/:id/role').put(protect, admin, updateUserRole);

module.exports = router;
