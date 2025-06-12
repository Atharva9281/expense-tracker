const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// ✅ FIXED: Delete expired trial accounts AND their data
const deleteExpiredTrialAccounts = async () => {
  try {
    const now = Date.now();
    
    // Find accounts that should be deleted:
    // 1. Not verified AND
    // 2. (Trial has expired OR old accounts without trial fields AND created more than 24 hours ago)
    const usersToDelete = await User.find({
      $and: [
        // Not verified (or missing isVerified field - legacy users)
        { 
          $or: [
            { isVerified: false },
            { isVerified: { $exists: false } } // Handle legacy users
          ]
        },
        {
          $or: [
            // Modern trial accounts that have expired
            {
              hasTrialAccess: true,
              trialExpiresAt: { $lt: new Date(now) }
            },
            // Legacy accounts without trial access (created more than 24 hours ago)
            {
              $and: [
                {
                  $or: [
                    { hasTrialAccess: { $ne: true } },
                    { hasTrialAccess: { $exists: false } }
                  ]
                },
                { createdAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) } }
              ]
            }
          ]
        }
      ]
    });

    if (usersToDelete.length === 0) {
      console.log('🧹 Cleanup: No expired accounts to delete');
      return { usersDeleted: 0, incomeDeleted: 0, expenseDeleted: 0, budgetDeleted: 0 };
    }

    console.log(`🧹 Cleanup: Found ${usersToDelete.length} expired accounts to delete`);
    
    // Get user IDs for deletion
    const userIds = usersToDelete.map(user => user._id);
    const userEmails = usersToDelete.map(user => user.email);
    
    console.log('📧 Deleting accounts:', userEmails);

    // ✅ FIXED: Delete all user data in the correct order
    
    // 1. Delete user's income transactions
    const incomeResult = await Income.deleteMany({ 
      userId: { $in: userIds } 
    });
    
    // 2. Delete user's expense transactions  
    const expenseResult = await Expense.deleteMany({ 
      userId: { $in: userIds } 
    });
    
    // 3. Delete user's budgets
    const budgetResult = await Budget.deleteMany({ 
      userId: { $in: userIds } 
    });
    
    // 4. Finally delete the users themselves
    const userResult = await User.deleteMany({ 
      _id: { $in: userIds } 
    });
    
    console.log(`🧹 Cleanup Results:`);
    console.log(`   👤 Users deleted: ${userResult.deletedCount}`);
    console.log(`   💰 Income records deleted: ${incomeResult.deletedCount}`);
    console.log(`   💸 Expense records deleted: ${expenseResult.deletedCount}`);
    console.log(`   🎯 Budget records deleted: ${budgetResult.deletedCount}`);
    console.log(`   📧 Accounts: ${userEmails.join(', ')}`);
    
    return {
      usersDeleted: userResult.deletedCount,
      incomeDeleted: incomeResult.deletedCount,
      expenseDeleted: expenseResult.deletedCount,
      budgetDeleted: budgetResult.deletedCount,
      deletedEmails: userEmails
    };
    
  } catch (error) {
    console.error('❌ Trial cleanup job error:', error);
    return { usersDeleted: 0, incomeDeleted: 0, expenseDeleted: 0, budgetDeleted: 0 };
  }
};

// ✅ UPDATED: Clean up expired verification tokens
const cleanupExpiredTokens = async () => {
  try {
    const result = await User.updateMany(
      {
        verificationExpires: { $lt: Date.now() },
        isVerified: false
      },
      {
        $unset: { 
          verificationToken: 1, 
          verificationExpires: 1 
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleanup: Cleaned ${result.modifiedCount} expired verification tokens`);
    }
    
    return { tokensCleanedUp: result.modifiedCount };
  } catch (error) {
    console.error('❌ Token cleanup error:', error);
    return { tokensCleanedUp: 0 };
  }
};

// ✅ FIXED: Get cleanup statistics with correct logic
const getCleanupStats = async () => {
  try {
    const now = Date.now();
    
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          
          // ✅ FIX: Only count users where isVerified is explicitly true
          verifiedUsers: {
            $sum: { 
              $cond: [
                { $eq: ['$isVerified', true] }, 
                1, 
                0
              ] 
            }
          },
          
          // ✅ FIX: Count users where isVerified is false OR doesn't exist
          unverifiedUsers: {
            $sum: { 
              $cond: [
                { 
                  $or: [
                    { $eq: ['$isVerified', false] },
                    { $eq: ['$isVerified', null] },
                    { $not: { $ifNull: ['$isVerified', false] } }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          
          // ✅ FIX: Active trial users - must be unverified AND have active trial
          activeTrialUsers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    // Must be unverified
                    { 
                      $or: [
                        { $eq: ['$isVerified', false] },
                        { $eq: ['$isVerified', null] },
                        { $not: { $ifNull: ['$isVerified', false] } }
                      ]
                    },
                    // Must have trial access
                    { $eq: ['$hasTrialAccess', true] },
                    // Trial must not be expired
                    { $gt: ['$trialExpiresAt', new Date(now)] }
                  ]
                },
                1,
                0
              ]
            }
          },
          
          // ✅ FIX: Expired trial users - unverified with expired trial
          expiredTrialUsers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    // Must be unverified
                    { 
                      $or: [
                        { $eq: ['$isVerified', false] },
                        { $eq: ['$isVerified', null] },
                        { $not: { $ifNull: ['$isVerified', false] } }
                      ]
                    },
                    // Must have trial access
                    { $eq: ['$hasTrialAccess', true] },
                    // Trial must be expired
                    { $lt: ['$trialExpiresAt', new Date(now)] }
                  ]
                },
                1,
                0
              ]
            }
          },
          
          // ✅ FIX: Legacy unverified users - unverified without trial, old accounts
          legacyUnverifiedUsers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    // Must be unverified
                    { 
                      $or: [
                        { $eq: ['$isVerified', false] },
                        { $eq: ['$isVerified', null] },
                        { $not: { $ifNull: ['$isVerified', false] } }
                      ]
                    },
                    // Must NOT have active trial access
                    { 
                      $or: [
                        { $ne: ['$hasTrialAccess', true] },
                        { $eq: ['$hasTrialAccess', null] },
                        { $not: { $ifNull: ['$hasTrialAccess', false] } }
                      ]
                    },
                    // Must be old (created more than 24 hours ago)
                    { $lt: ['$createdAt', new Date(now - 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalUsers: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      activeTrialUsers: 0,
      expiredTrialUsers: 0,
      legacyUnverifiedUsers: 0
    };
  } catch (error) {
    console.error('❌ Stats error:', error);
    return null;
  }
};

// ✅ IMPROVED: Run all cleanup jobs with better logging
const runCleanupJobs = async () => {
  console.log('🧹 Running cleanup jobs...');
  
  // Get stats before cleanup
  const statsBefore = await getCleanupStats();
  if (statsBefore) {
    console.log('📊 Database Status:');
    console.log(`   👥 Total users: ${statsBefore.totalUsers}`);
    console.log(`   ✅ Verified users: ${statsBefore.verifiedUsers}`);
    console.log(`   ⏳ Active trial users: ${statsBefore.activeTrialUsers}`);
    console.log(`   ⚠️  Expired trial users: ${statsBefore.expiredTrialUsers}`);
    console.log(`   🗂️  Legacy unverified users: ${statsBefore.legacyUnverifiedUsers}`);
    
    const usersToDelete = statsBefore.expiredTrialUsers + statsBefore.legacyUnverifiedUsers;
    if (usersToDelete > 0) {
      console.log(`🎯 Accounts scheduled for deletion: ${usersToDelete}`);
    } else {
      console.log('✅ No accounts need deletion');
    }
  }
  
  // Run cleanup
  const deleteResults = await deleteExpiredTrialAccounts();
  const tokenResults = await cleanupExpiredTokens();
  
  // Show results with timestamps
  if (deleteResults.usersDeleted > 0 || tokenResults.tokensCleanedUp > 0) {
    console.log('');
    console.log('🗑️  CLEANUP COMPLETED:');
    console.log(`   📅 ${new Date().toLocaleString()}`);
    console.log(`   👤 Users deleted: ${deleteResults.usersDeleted}`);
    console.log(`   💰 Income records deleted: ${deleteResults.incomeDeleted}`);
    console.log(`   💸 Expense records deleted: ${deleteResults.expenseDeleted}`);
    console.log(`   🎯 Budget records deleted: ${deleteResults.budgetDeleted}`);
    console.log(`   🔑 Tokens cleaned: ${tokenResults.tokensCleanedUp}`);
    
    if (deleteResults.deletedEmails && deleteResults.deletedEmails.length > 0) {
      console.log(`   📧 Deleted accounts: ${deleteResults.deletedEmails.join(', ')}`);
    }
    console.log('');
  } else {
    console.log('✅ No cleanup needed - all accounts are valid');
  }
  
  // Get final stats
  const statsAfter = await getCleanupStats();
  if (statsAfter) {
    console.log('📊 Final Status:');
    console.log(`   👥 Total users: ${statsAfter.totalUsers}`);
    console.log(`   ✅ Verified users: ${statsAfter.verifiedUsers}`);
    console.log(`   ⏳ Active trial users: ${statsAfter.activeTrialUsers}`);
    console.log('');
  }
};

// Start cleanup jobs (runs every hour)
const startCleanupJobs = () => {
  // Run immediately on startup
  runCleanupJobs();
  
  // Then run every hour
  setInterval(runCleanupJobs, 60 * 60 * 1000); // 1 hour
  console.log('✅ Cleanup jobs started - running every hour');
};

// ✅ NEW: Manual cleanup function for testing
const runManualCleanup = async () => {
  console.log('🧹 MANUAL CLEANUP REQUESTED');
  await runCleanupJobs();
};

module.exports = { 
  startCleanupJobs,
  runCleanupJobs,
  runManualCleanup,
  deleteExpiredTrialAccounts,
  cleanupExpiredTokens,
  getCleanupStats
};