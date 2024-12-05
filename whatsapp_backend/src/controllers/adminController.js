// src/controllers/adminController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.createUser = async (req, res) => {
  try {
    const { email, password, fullName, role, companyName, expiryDate } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with company name
    const user = await User.create({
      email,
      password,
      fullName,
      role: role || 'user',
      companyName,
      expiryDate
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
        expiryDate: user.expiryDate
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: 'User status updated', isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { months } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    
    user.subscriptionEndDate = endDate;
    user.isSuspended = false;
    await user.save();

    res.json({ 
      message: 'Subscription updated',
      subscriptionEndDate: user.subscriptionEndDate 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

exports.updateUserTitle = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { title },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Backend: adminController.js
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isSuspended } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if suspension is due to expiry
    const isExpired = user.expiryDate && new Date(user.expiryDate) < new Date();

    res.json({
      success: true,
      user: {
        _id: user._id,
        isSuspended: user.isSuspended,
        isExpired
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

exports.updateUserCompany = async (req, res) => {
  try {
    const { userId } = req.params;
    const { companyName } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { companyName },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update company name' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.updateUserDate = async (req, res) => {
  try {
    const { userId } = req.params;
    let { expiryDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const dateToSave = new Date(expiryDate);
    if (isNaN(dateToSave.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { expiryDate: dateToSave },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        expiryDate: dateToSave.toISOString()
      }
    });

  } catch (error) {
    console.error('Update date error:', error);
    res.status(500).json({
      success: false, 
      message: 'Failed to update expiry date'
    });
  }
};