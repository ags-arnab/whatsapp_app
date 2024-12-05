// src/utils/subscriptionChecker.js - Add subscription checker
const User = require('../models/User');

const checkSubscriptions = async () => {
  try {
    const now = new Date();
    const expiredUsers = await User.updateMany(
      {
        subscriptionEndDate: { $lt: now },
        isSuspended: false
      },
      {
        $set: { isSuspended: true }
      }
    );

    console.log(`Updated ${expiredUsers.modifiedCount} expired subscriptions`);
  } catch (error) {
    console.error('Subscription check failed:', error);
  }
};

module.exports = checkSubscriptions;