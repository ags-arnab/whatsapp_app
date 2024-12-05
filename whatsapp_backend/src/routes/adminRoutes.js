// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');  // Import both middlewares

router.use(protect);
router.use(authorize('admin'));

router.post('/create-user', adminController.createUser);
router.post('/reset-password', adminController.resetPassword);
router.get('/users', adminController.getUsers);
router.get('/users/search', adminController.searchUsers);
router.put('/users/:userId/status', protect, authorize('admin'), adminController.updateUserStatus);
router.put('/users/:userId/company', protect, authorize('admin'), adminController.updateUserCompany);
router.put('/users/:userId/expiry', protect, authorize('admin'), adminController.updateUserDate);
router.delete('/users/:userId', protect, authorize('admin'), adminController.deleteUser);

module.exports = router;