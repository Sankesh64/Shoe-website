const User = require('../models/User');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product wishlist');

  if (user) {
    res.json({
      success: true,
      data: user,
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

/**
 * @desc    Sync cart
 * @route   POST /api/users/cart
 * @access  Private
 */
exports.syncCart = async (req, res) => {
  const { cart } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.cart = cart;
    await user.save();
    res.json({ success: true, message: 'Cart synced successfully' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

/**
 * @desc    Sync wishlist
 * @route   POST /api/users/wishlist
 * @access  Private
 */
exports.syncWishlist = async (req, res) => {
  const { wishlist } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.wishlist = wishlist;
    await user.save();
    res.json({ success: true, message: 'Wishlist synced successfully' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

// ADMIN CONTROLLERS

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  const users = await User.find({});
  res.json({ success: true, data: users });
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

/**
 * @desc    Update user to admin
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};
