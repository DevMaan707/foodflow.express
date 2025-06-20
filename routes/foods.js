const express = require("express");
const router = express.Router();
const Food = require("../models/Food");
const FoodRequest = require("../models/FoodRequest");
const User = require("../models/User");
// Assuming you have auth middleware
// const { protect } = require('../middleware/auth');

// Helper functions
const calculateTimeRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours <= 0) return "Expired";
  if (diffHours < 24) return `${diffHours} hours`;
  if (diffDays === 1) return "1 day";
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
};

const calculatePostedTime = (createdAt) => {
  const now = new Date();
  const posted = new Date(createdAt);
  const diffTime = now - posted;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

// @desc    Get all foods with filters
// @route   GET /api/foods
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      lat,
      lng,
      radius = 50, // default 50km radius
      limit = 20,
      page = 1,
    } = req.query;

    // Build query
    let query = { status: "available" };

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Location filter
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
    }

    const foods = await Food.find(query)
      .populate(
        "donor",
        "firstName lastName organizationName averageRating totalRatings isVerified",
      )
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Transform data for frontend
    const transformedFoods = foods.map((food) => {
      const donor = food.donor;
      const donorName =
        donor.organizationName || `${donor.firstName} ${donor.lastName}`;

      return {
        id: food._id,
        title: food.title,
        description: food.description,
        category: food.category,
        quantity: food.quantity,
        donor: donorName,
        location: food.location?.address || "Location not specified",
        distance:
          lat && lng
            ? calculateDistance(
                food.location?.coordinates,
                parseFloat(lat),
                parseFloat(lng),
              )
            : "N/A",
        expiryTime: calculateTimeRemaining(food.expiryDate),
        verified: donor.isVerified || false,
        rating: donor.averageRating || 0,
        postedTime: calculatePostedTime(food.createdAt),
        images: food.images || [],
        pickupInstructions: food.pickupInstructions,
        dietaryInfo: food.dietaryInfo,
        averageRating: food.averageRating || 0,
        totalRatings: food.totalRatings || 0,
      };
    });

    res.status(200).json(transformedFoods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
});

// Helper function to calculate distance
const calculateDistance = (coordinates, lat, lng) => {
  if (!coordinates || coordinates.length !== 2) return "N/A";

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat - coordinates[1]) * Math.PI) / 180;
  const dLng = ((lng - coordinates[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coordinates[1] * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance.toFixed(1)}km`;
};

// @desc    Create new food post
// @route   POST /api/foods
// @access  Private (Donors only)
router.post(
  "/",
  /* protect, */ async (req, res) => {
    try {
      const foodData = {
        ...req.body,
        // donor: req.user.id, // Uncomment when auth is implemented
      };

      const food = new Food(foodData);
      await food.save();

      // Populate donor info
      await food.populate(
        "donor",
        "firstName lastName organizationName averageRating totalRatings isVerified",
      );

      res.status(201).json({
        success: true,
        message: "Food post created successfully",
        food,
      });
    } catch (error) {
      console.error("Error creating food:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create food post",
        error: error.message,
      });
    }
  },
);

// @desc    Get food by ID
// @route   GET /api/foods/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      "donor",
      "firstName lastName organizationName averageRating totalRatings isVerified phone email address operatingHours",
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food post not found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch food post",
      error: error.message,
    });
  }
});

// @desc    Create food request
// @route   POST /api/foods/:id/request
// @access  Private (Receivers only)
router.post(
  "/:id/request",
  /* protect, */ async (req, res) => {
    try {
      const { quantityRequested, message } = req.body;
      const foodId = req.params.id;

      // Check if food exists and is available
      const food = await Food.findById(foodId);
      if (!food || food.status !== "available") {
        return res.status(400).json({
          success: false,
          message: "Food item is not available",
        });
      }

      // Check if user already has a pending request for this food
      // Uncomment when auth is implemented
      /*
    const existingRequest = await FoodRequest.findOne({
      food: foodId,
      requester: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this item'
      });
    }
    */

      const request = new FoodRequest({
        food: foodId,
        requester: "6853975b17ca1745dcabf57e", // Uncomment when auth is implemented
        donor: food.donor,
        quantityRequested,
        message,
      });

      await request.save();

      // Update food total requests
      food.totalRequests += 1;
      await food.save();

      // Populate the request for response
      await request.populate([
        { path: "food", select: "title category" },
        { path: "requester", select: "firstName lastName organizationName" },
        { path: "donor", select: "firstName lastName organizationName" },
      ]);

      res.status(201).json({
        success: true,
        message: "Request sent successfully",
        request,
      });
    } catch (error) {
      console.error("Error creating request:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create request",
        error: error.message,
      });
    }
  },
);

// @desc    Get user's requests (for receivers)
// @route   GET /api/foods/requests/my
// @access  Private (Receivers only)
router.get(
  "/requests/my",
  /* protect, */ async (req, res) => {
    try {
      // Uncomment when auth is implemented
      // const requests = await FoodRequest.find({ requester: req.user.id })

      // For now, return all requests (remove this when auth is implemented)
      const requests = await FoodRequest.find()
        .populate("food", "title category")
        .populate("donor", "firstName lastName organizationName")
        .sort({ createdAt: -1 });

      // Transform for frontend
      const transformedRequests = requests.map((request) => {
        const donor = request.donor;
        const donorName =
          donor.organizationName || `${donor.firstName} ${donor.lastName}`;

        return {
          id: request._id,
          postTitle: request.food.title,
          donor: donorName,
          status: request.status,
          requestedAt: calculatePostedTime(request.createdAt),
          quantity: request.quantityRequested,
          message: request.message,
          donorResponse: request.donorResponse,
          priority: request.priority,
        };
      });

      res.status(200).json(transformedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch requests",
        error: error.message,
      });
    }
  },
);

// @desc    Update request status (for donors)
// @route   PUT /api/foods/requests/:id/status
// @access  Private (Donors only)
router.put(
  "/requests/:id/status",
  /* protect, */ async (req, res) => {
    try {
      const { status, response } = req.body;

      const request = await FoodRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
          error: "Request not found",
        });
      }

      // Check if user is the requester
      if (request.requester !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not the requester of this request",
          error: "You are not the requester of this request",
        });
      }

      // Check if request is already resolved
      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Request is already resolved",
          error: "Request is already resolved",
        });
      }

      // Update request status
      request.status = status;
      request.donorResponse = response;
      await request.save();

      res.status(200).json({
        success: true,
        message: "Request status updated successfully",
        request,
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update request status",
        error: error.message,
      });
    }
  },
);

// @desc    Get food requests by ID
// @route   GET /api/foods/requests/:id
// @access  Public
router.get("/requests/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id)
      .populate("food", "title category")
      .populate("donor", "firstName lastName organizationName")
      .populate("requester", "firstName lastName organizationName");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch request",
      error: error.message,
    });
  }
});

// @desc    Delete food request by ID
// @route   DELETE /api/foods/requests/:id
// @access  Private (Receivers only)
router.delete(
  "/requests/:id",
  /* protect, */ async (req, res) => {
    try {
      const request = await FoodRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      // Check if user is the requester
      if (request.requester !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not the requester of this request",
        });
      }

      // Delete request
      await request.remove();

      res.status(200).json({
        success: true,
        message: "Request deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      res.status(400).json({
        success: false,
        message: "Failed to delete request",
        error: error.message,
      });
    }
  },
);

module.exports = router;
