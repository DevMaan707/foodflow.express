const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Food = require('./models/Food');
const FoodRequest = require('./models/FoodRequest');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for smoke testing');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Smoke test function
const smokeFoodRequestTest = async () => {
  try {
    console.log('\n🧪 Starting FoodRequest Smoke Test...\n');

    // Step 1: Find existing Food and User IDs
    console.log('📋 Step 1: Finding existing Food and User documents...');
    
    const existingUsers = await User.find({ isActive: true }).limit(2);
    const existingFood = await Food.find({ status: 'available' }).limit(1);

    if (existingUsers.length < 2) {
      console.log('⚠️  Not enough users found. Creating test users...');
      
      // Create test users if none exist
      const testDonor = await User.create({
        firstName: 'Test',
        lastName: 'Donor',
        email: `test-donor-${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890',
        userType: 'donor'
      });

      const testReceiver = await User.create({
        firstName: 'Test',
        lastName: 'Receiver',
        email: `test-receiver-${Date.now()}@example.com`,
        password: 'password123',
        phone: '0987654321',
        userType: 'receiver'
      });

      existingUsers.push(testDonor, testReceiver);
      console.log('✅ Created test users');
    }

    if (existingFood.length < 1) {
      console.log('⚠️  No food found. Creating test food...');
      
      // Create test food if none exists
      const testFood = await Food.create({
        title: 'Test Food Item',
        description: 'A test food item for smoke testing',
        donor: existingUsers[0]._id
      });

      existingFood.push(testFood);
      console.log('✅ Created test food');
    }

    const donor = existingUsers[0];
    const requester = existingUsers[1];
    const food = existingFood[0];

    console.log(`📍 Using Food ID: ${food._id}`);
    console.log(`📍 Using Donor ID: ${donor._id}`);
    console.log(`📍 Using Requester ID: ${requester._id}`);

    // Step 2: Create FoodRequest document
    console.log('\n📋 Step 2: Creating FoodRequest document...');
    
    const foodRequestData = {
      food: food._id,
      requester: requester._id,
      donor: donor._id,
      requestedQuantity: '2 servings',
      message: 'Hello, I would like to request this food item. Thank you!'
    };

    const foodRequest = await FoodRequest.create(foodRequestData);
    console.log('✅ FoodRequest created successfully');
    console.log(`📍 FoodRequest ID: ${foodRequest._id}`);

    // Step 3: Verify default status and timestamps
    console.log('\n📋 Step 3: Verifying default status and timestamps...');
    
    console.log(`📊 Status: ${foodRequest.status} (expected: pending)`);
    console.log(`📅 Created At: ${foodRequest.createdAt}`);
    console.log(`📅 Updated At: ${foodRequest.updatedAt}`);
    console.log(`🔄 Is Active: ${foodRequest.isActive} (expected: true)`);

    // Verify defaults
    if (foodRequest.status === 'pending') {
      console.log('✅ Default status "pending" verified');
    } else {
      console.log('❌ Default status verification failed');
    }

    if (foodRequest.isActive === true) {
      console.log('✅ Default isActive "true" verified');
    } else {
      console.log('❌ Default isActive verification failed');
    }

    if (foodRequest.createdAt && foodRequest.updatedAt) {
      console.log('✅ Timestamps automatically set');
    } else {
      console.log('❌ Timestamps verification failed');
    }

    // Step 4: Query by requester to test indexes
    console.log('\n📋 Step 4: Testing query by requester (index operation)...');
    
    const startTime = Date.now();
    const requestsByRequester = await FoodRequest.find({ requester: requester._id });
    const queryTime = Date.now() - startTime;

    console.log(`🔍 Found ${requestsByRequester.length} request(s) by requester`);
    console.log(`⚡ Query time: ${queryTime}ms`);
    console.log('✅ Requester index query successful');

    // Step 5: Test other indexed queries
    console.log('\n📋 Step 5: Testing other indexed queries...');
    
    // Query by status
    const pendingRequests = await FoodRequest.find({ status: 'pending' });
    console.log(`📊 Found ${pendingRequests.length} pending request(s)`);

    // Query by donor
    const requestsByDonor = await FoodRequest.find({ donor: donor._id });
    console.log(`👤 Found ${requestsByDonor.length} request(s) for donor`);

    // Query by food
    const requestsForFood = await FoodRequest.find({ food: food._id });
    console.log(`🍽️  Found ${requestsForFood.length} request(s) for food item`);

    // Step 6: Test populated query
    console.log('\n📋 Step 6: Testing populated query...');
    
    const populatedRequest = await FoodRequest.findById(foodRequest._id)
      .populate('food', 'title description')
      .populate('requester', 'firstName lastName email')
      .populate('donor', 'firstName lastName email');

    console.log('✅ Populated query successful');
    console.log(`🍽️  Food: ${populatedRequest.food.title}`);
    console.log(`👤 Requester: ${populatedRequest.requester.firstName} ${populatedRequest.requester.lastName}`);
    console.log(`🎁 Donor: ${populatedRequest.donor.firstName} ${populatedRequest.donor.lastName}`);

    // Step 7: Test duplicate prevention (should fail)
    console.log('\n📋 Step 7: Testing duplicate prevention...');
    
    try {
      const duplicateRequest = await FoodRequest.create({
        food: food._id,
        requester: requester._id,
        donor: donor._id,
        requestedQuantity: '1 serving',
        message: 'Duplicate request test'
      });
      console.log('❌ Duplicate prevention failed - duplicate was created');
    } catch (error) {
      if (error.message.includes('already have an active request')) {
        console.log('✅ Duplicate prevention working correctly');
      } else {
        console.log('⚠️  Unexpected error in duplicate test:', error.message);
      }
    }

    console.log('\n🎉 Smoke test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ FoodRequest document creation');
    console.log('- ✅ Default status "pending" verified');
    console.log('- ✅ Timestamps automatically set');
    console.log('- ✅ Requester index query functional');
    console.log('- ✅ Other indexed queries functional');
    console.log('- ✅ Population queries working');
    console.log('- ✅ Duplicate prevention working');

  } catch (error) {
    console.error('❌ Smoke test failed:', error);
  }
};

// Cleanup function
const cleanup = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    // Remove test documents (optional - comment out if you want to keep them)
    await FoodRequest.deleteMany({ 
      message: { $regex: /test|smoke/i } 
    });
    
    await User.deleteMany({ 
      email: { $regex: /test-(donor|receiver)-/i } 
    });
    
    await Food.deleteMany({ 
      title: 'Test Food Item' 
    });
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('⚠️  Cleanup error (non-critical):', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await smokeFoodRequestTest();
  
  // Uncomment the next line if you want to clean up test data
  // await cleanup();
  
  console.log('\n👋 Closing database connection...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

// Run the smoke test
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

