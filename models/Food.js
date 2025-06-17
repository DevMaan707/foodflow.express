const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Food title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor is required"],
    },
    category: {
      type: String,
      enum: [
        "cooked_food",
        "raw_ingredients",
        "packaged_food",
        "dairy",
        "bakery",
        "fruits_vegetables",
        "grains_cereals",
        "other",
      ],
      required: [true, "Food category is required"],
    },
    foodType: {
      type: String,
      enum: ["vegetarian", "non_vegetarian", "vegan"],
      required: [true, "Food type is required"],
    },
    quantity: {
      value: {
        type: Number,
        required: [true, "Quantity value is required"],
        min: [1, "Quantity must be at least 1"],
      },
      unit: {
        type: String,
        enum: ["kg", "grams", "liters", "pieces", "plates", "packets", "boxes"],
        required: [true, "Quantity unit is required"],
      },
    },
    price: {
      type: Number,
      default: 0.0,
      min: [0, "Price cannot be negative"],
    },
    priceType: {
      type: String,
      enum: ["free", "discounted"],
      default: "free",
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (date) {
          return date > new Date();
        },
        message: "Expiry date must be in the future",
      },
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableUntil: {
      type: Date,
      required: [true, "Available until date is required"],
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, "Pickup address is required"],
      },
      coordinates: {
        type: [Number],
        required: [true, "Pickup coordinates are required"],
        index: "2dsphere",
      },
    },

    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "picked_up",
        "expired",
        "cancelled",
        "pending_approval",
      ],
      default: "available",
    },
    maxRequests: {
      type: Number,
      default: 1,
      min: [1, "Maximum requests must be at least 1"],
    },
    currentRequests: {
      type: Number,
      default: 0,
    },
    specialInstructions: {
      type: String,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
    },
    allergenInfo: [
      {
        type: String,
        enum: ["nuts", "dairy", "gluten", "eggs", "soy", "shellfish", "other"],
      },
    ],
    isApproved: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
foodSchema.index({ donor: 1 });
foodSchema.index({ status: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ foodType: 1 });
foodSchema.index({ expiryDate: 1 });
foodSchema.index({ "pickupLocation.coordinates": "2dsphere" });
foodSchema.index({ createdAt: -1 });
foodSchema.index({ price: 1 });
foodSchema.index({ status: 1, expiryDate: 1 });
foodSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Food", foodSchema);
