# FoodFlow Express Backend

A comprehensive Node.js/Express.js backend API for the FoodFlow food sharing platform. This backend serves as the API layer for the [foodflow.react](https://github.com/DevMaan707/foodflow.react) frontend application, enabling food donors and receivers to connect and share surplus food.

## 📖 Overview

FoodFlow is a platform that connects food donors (restaurants, grocery stores, individuals) with food receivers (NGOs, charities, individuals in need) to reduce food waste and address food insecurity. This Express.js backend provides:

- **User Management**: Registration, authentication, and profiles for donors and receivers
- **Food Listings**: CRUD operations for food items with geolocation support
- **Request System**: Food request management between donors and receivers
- **Booking Management**: Handle pickup appointments and logistics
- **Real-time Notifications**: Keep users informed about request status
- **Analytics & Reporting**: Track platform usage and impact metrics

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based secure authentication
- **User Types**: Support for donors, receivers, and admin users
- **Geolocation Services**: Location-based food discovery with distance calculations
- **Image Upload**: Cloudinary integration for food images
- **Email Notifications**: Automated email system using Nodemailer
- **Data Validation**: Comprehensive input validation with express-validator
- **Database Indexing**: Optimized MongoDB queries with proper indexing

### API Capabilities
- **RESTful API Design**: Clean, consistent API endpoints
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: API health check endpoints
- **Smoke Testing**: Built-in testing suite for API validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer with Cloudinary integration
- **Email Service**: Nodemailer
- **Validation**: express-validator
- **Scheduling**: node-cron for automated tasks
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
foodflow.express/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/              # Request handlers and business logic
├── models/                   # Mongoose data models
│   ├── User.js              # User model (donors, receivers, admins)
│   ├── Food.js              # Food item model
│   ├── Booking.js           # Booking/appointment model
│   ├── FoodRequest.js       # Food request model
│   ├── Notification.js      # Notification model
│   ├── Analytics.js         # Analytics tracking model
│   ├── Report.js            # Reporting model
│   └── Request.js           # General request model
├── routes/                   # API route definitions
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── foods.js             # Food CRUD routes
│   ├── bookings.js          # Booking management routes
│   └── health.js            # Health check routes
├── bruno/                    # Bruno API testing collection
├── tests/
│   ├── smoke-test-foodrequest.js  # Automated testing script
│   └── smoke-test.sh             # Shell script for testing
├── server.js                 # Main application entry point
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevMaan707/foodflow.express.git
   cd foodflow.express
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/foodflow
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodflow

   # Server
   PORT=6069

   # JWT Authentication
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d

   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm start

   # Or directly with node
   node server.js
   ```

   The server will start on `http://localhost:6069` (or your specified PORT).

### Verify Installation

Check if the server is running:
```bash
curl http://localhost:6069/api/health
```

## 📚 API Documentation

### Base URL
```
http://localhost:6069/api
```

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### User Routes (`/api/users`)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user account

### Food Routes (`/api/foods`)
- `GET /api/foods` - Get all available food items
- `POST /api/foods` - Create new food listing (donors only)
- `GET /api/foods/:id` - Get specific food item
- `PUT /api/foods/:id` - Update food item (owner only)
- `DELETE /api/foods/:id` - Delete food item (owner only)

### Booking Routes (`/api/bookings`)
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking status

### Health Check (`/api/health`)
- `GET /api/health` - Server health status

## 🗃️ Data Models

### User Model
- **Types**: donor, receiver, admin
- **Authentication**: Email/password with JWT
- **Location**: Address with coordinates for geolocation
- **Verification**: Approval system for receivers
- **Organization**: Support for NGOs, restaurants, etc.

### Food Model
- **Categories**: vegetables, bakery, cooked, canned, dairy, grains, other
- **Location**: Geospatial indexing for proximity searches
- **Expiry Tracking**: Automatic status updates based on dates
- **Images**: Multiple image support via Cloudinary
- **Dietary Info**: Vegetarian, vegan, halal, kosher, allergen information

### Booking Model
- **Status Tracking**: pending, confirmed, completed, cancelled
- **Scheduling**: Pickup time coordination
- **Communication**: Messages between donors and receivers

## 🧪 Testing

### Automated Testing

Run the comprehensive smoke test:
```bash
node smoke-test-foodrequest.js
```

Or use the shell script:
```bash
./smoke-test.sh
```

### Manual API Testing

#### Using Bruno (Recommended)
1. Import the Bruno collection from the `/bruno` directory
2. Configure environment variables
3. Run the test suite

#### Using Postman
1. Import `postman-foodrequest-smoketest.json`
2. Set base URL to `http://localhost:6069/api`
3. Run the collection

#### Using cURL
See [FOODREQUEST_SMOKE_TEST_GUIDE.md](./FOODREQUEST_SMOKE_TEST_GUIDE.md) for detailed cURL examples.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/foodflow` |
| `PORT` | Server port | No | `6069` |
| `JWT_SECRET` | JWT signing secret | Yes | `your_secret_key` |
| `JWT_EXPIRE` | JWT expiration time | No | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No | `your_api_secret` |

### CORS Configuration

The API is configured to accept requests from any origin (`*`) for development. For production, update the CORS settings in `server.js`:

```javascript
const corsOptions = {
  origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

## 🚢 Deployment

### Local Development
```bash
npm start
```

### Production Deployment

1. **Environment Setup**
   - Set production environment variables
   - Use production MongoDB instance
   - Configure proper CORS origins

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "foodflow-api"
   
   # Or using Docker
   docker build -t foodflow-express .
   docker run -p 6069:6069 --env-file .env foodflow-express
   ```

3. **Reverse Proxy**
   Configure Nginx or Apache to proxy requests to the Node.js server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add appropriate error handling
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Smoke Test Guide**: [FOODREQUEST_SMOKE_TEST_GUIDE.md](./FOODREQUEST_SMOKE_TEST_GUIDE.md)
- **API Testing**: Use the provided Postman collection or Bruno tests
- **Issues**: [GitHub Issues](https://github.com/DevMaan707/foodflow.express/issues)

## 🔗 Related Projects

- **Frontend**: [foodflow.react](https://github.com/DevMaan707/foodflow.react) - React.js frontend application
- **Mobile**: Coming soon - React Native mobile application

## 📊 Project Status

- ✅ Core API endpoints implemented
- ✅ Authentication system complete
- ✅ Database models defined
- ✅ Testing framework established
- 🚧 Advanced features in development
- 🚧 Production deployment optimizations

## 🙏 Acknowledgments

- Express.js community for the robust framework
- MongoDB team for the flexible database solution
- Cloudinary for image management services
- All contributors and testers who helped improve this project

---

**Made with ❤️ for reducing food waste and fighting hunger**

For questions, suggestions, or contributions, please reach out through GitHub issues or contact the development team.

