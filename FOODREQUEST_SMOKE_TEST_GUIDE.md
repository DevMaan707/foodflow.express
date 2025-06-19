# FoodRequest Smoke Test Guide

This guide provides comprehensive instructions for smoke testing the `FoodRequest` model to ensure backend readiness before frontend integration.

## Overview

The smoke test validates:
1. ✅ **FoodRequest document creation** with proper references to existing Food and User IDs
2. ✅ **Default status verification** - ensures status defaults to `pending`
3. ✅ **Timestamp validation** - verifies `createdAt` and `updatedAt` are automatically set
4. ✅ **Index performance testing** - queries by `requester`, `donor`, `status`, and `food` to ensure indexes operate efficiently
5. ✅ **Population testing** - verifies relationships can be populated correctly
6. ✅ **Duplicate prevention** - ensures the unique compound index prevents duplicate active requests

## Prerequisites

### 1. Backend Server Running
Ensure your Express server is running:

```bash
cd /path/to/foodflow.express
npm start
# OR
node server.js
```

The server should be accessible at `http://localhost:5000` (or your configured PORT).

### 2. Database Connection
Ensure MongoDB is running and accessible via your `MONGODB_URI` environment variable.

### 3. Required API Routes
The smoke test assumes the following API endpoints exist:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/foods` - Create food item
- `POST /api/food-requests` - Create food request
- `GET /api/food-requests` - List food requests (with query parameters)
- `GET /api/food-requests/:id` - Get single food request
- `DELETE /api/food-requests/:id` - Delete food request
- `DELETE /api/foods/:id` - Delete food item

## Testing Methods

### Method 1: Postman Collection (Recommended)

#### Step 1: Import Collection
1. Open Postman
2. Click "Import" 
3. Select the file: `postman-foodrequest-smoketest.json`
4. The collection "FoodRequest Smoke Test Collection" will be imported

#### Step 2: Configure Environment
1. In Postman, ensure the collection variables are set:
   - `baseUrl`: `http://localhost:5000/api` (adjust port if needed)
   - Other variables will be set automatically during test execution

#### Step 3: Run Collection
1. Right-click the collection
2. Select "Run collection"
3. Ensure all requests are selected
4. Click "Run FoodRequest Smoke Test Collection"

#### Step 4: Review Results
The runner will show:
- ✅ **Green** tests indicate successful validation
- ❌ **Red** tests indicate issues that need attention
- **Console logs** provide detailed information about each test

### Method 2: Manual API Testing

If you prefer manual testing, use these cURL commands:

#### Step 1: Create Test Users
```bash
# Create donor
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Donor", 
    "email": "test-donor@example.com",
    "password": "password123",
    "phone": "1234567890",
    "userType": "donor"
  }'

# Create receiver
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Receiver",
    "email": "test-receiver@example.com", 
    "password": "password123",
    "phone": "0987654321",
    "userType": "receiver"
  }'
```

#### Step 2: Authenticate
```bash
# Login as donor to get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-donor@example.com",
    "password": "password123"
  }'
```

#### Step 3: Create Test Food
```bash
# Replace {AUTH_TOKEN} and {DONOR_ID} with actual values
curl -X POST http://localhost:5000/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {AUTH_TOKEN}" \
  -d '{
    "title": "Test Food Item",
    "description": "A test food item for smoke testing",
    "donor": "{DONOR_ID}"
  }'
```

#### Step 4: Create FoodRequest
```bash
# Replace placeholders with actual IDs and token
curl -X POST http://localhost:5000/api/food-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {AUTH_TOKEN}" \
  -d '{
    "food": "{FOOD_ID}",
    "requester": "{RECEIVER_ID}",
    "donor": "{DONOR_ID}",
    "requestedQuantity": "2 servings",
    "message": "Hello, I would like to request this food item. Thank you!"
  }'
```

#### Step 5: Test Queries
```bash
# Query by requester (index test)
curl -X GET "http://localhost:5000/api/food-requests?requester={RECEIVER_ID}" \
  -H "Authorization: Bearer {AUTH_TOKEN}"

# Query by status (index test)  
curl -X GET "http://localhost:5000/api/food-requests?status=pending" \
  -H "Authorization: Bearer {AUTH_TOKEN}"

# Query by donor (index test)
curl -X GET "http://localhost:5000/api/food-requests?donor={DONOR_ID}" \
  -H "Authorization: Bearer {AUTH_TOKEN}"

# Query by food (index test)
curl -X GET "http://localhost:5000/api/food-requests?food={FOOD_ID}" \
  -H "Authorization: Bearer {AUTH_TOKEN}"
```

### Method 3: Node.js Script (If Node.js Available)

If Node.js is installed, you can run the comprehensive script:

```bash
cd /path/to/foodflow.express
node smoke-test-foodrequest.js
```

## Expected Results

### ✅ Successful Test Results

1. **FoodRequest Creation**
   - Status: 201 Created
   - Response includes `_id`, `status: "pending"`, `isActive: true`
   - `createdAt` and `updatedAt` timestamps present

2. **Default Values Verification**
   - `status` field defaults to `"pending"`
   - `isActive` field defaults to `true`
   - Timestamps are automatically generated

3. **Index Performance**
   - All queries return within reasonable time (< 1000ms)
   - Queries by `requester`, `donor`, `status`, and `food` return correct results

4. **Duplicate Prevention**
   - Second request with same food/requester combination should fail
   - Error message: "You already have an active request for this food item"

### ❌ Common Issues and Solutions

1. **Database Connection Issues**
   ```
   Error: Database connection failed
   ```
   **Solution**: Verify MongoDB is running and `MONGODB_URI` is correct

2. **Missing API Routes**
   ```
   Error: 404 Not Found
   ```
   **Solution**: Ensure FoodRequest routes are implemented and registered

3. **Authentication Issues**
   ```
   Error: 401 Unauthorized
   ```
   **Solution**: Verify JWT authentication middleware is working

4. **Validation Errors**
   ```
   Error: Required field missing
   ```
   **Solution**: Check FoodRequest schema validation rules

## Model Verification Checklist

After running the smoke test, verify the following:

- [ ] FoodRequest documents can be created successfully
- [ ] Default status is "pending" 
- [ ] Default isActive is true
- [ ] Timestamps (createdAt, updatedAt) are automatically set
- [ ] Index on `requester` field enables fast queries
- [ ] Index on `donor` field enables fast queries  
- [ ] Index on `status` field enables fast queries
- [ ] Index on `food` field enables fast queries
- [ ] Compound unique index prevents duplicate active requests
- [ ] References to User and Food models work correctly
- [ ] Population of referenced documents works
- [ ] Validation rules are enforced

## Clean Up

The Postman collection includes cleanup steps that remove test data. If running manual tests, clean up with:

```bash
# Delete test food request
curl -X DELETE http://localhost:5000/api/food-requests/{FOOD_REQUEST_ID} \
  -H "Authorization: Bearer {AUTH_TOKEN}"

# Delete test food
curl -X DELETE http://localhost:5000/api/foods/{FOOD_ID} \
  -H "Authorization: Bearer {AUTH_TOKEN}"

# Note: Test users can be left for future testing or manually deleted via database
```

## Next Steps

Once smoke testing passes:

1. ✅ **Backend Validation**: FoodRequest model is ready for frontend integration
2. 🔄 **Frontend Integration**: Begin wiring frontend components to FoodRequest APIs
3. 🧪 **Integration Testing**: Test end-to-end workflows with frontend + backend
4. 🚀 **User Acceptance Testing**: Validate complete user journeys

## Troubleshooting

### Performance Issues
If queries are slow:
- Verify database indexes are created: `db.foodrequests.getIndexes()`
- Check MongoDB performance with `db.foodrequests.explain()` 

### Data Integrity Issues
If duplicate prevention fails:
- Verify compound index exists: `unique_active_food_requester`
- Check partial filter expression in index

### Authentication Issues
If auth fails:
- Verify JWT_SECRET is set in environment
- Check token expiration settings
- Ensure middleware is properly configured

## Support

For issues with the smoke test:
1. Check server logs for detailed error messages
2. Verify all environment variables are set
3. Ensure database permissions are correct
4. Test individual API endpoints separately

---

**Success Criteria**: All tests pass with green checkmarks, indicating the FoodRequest model is ready for frontend integration.

