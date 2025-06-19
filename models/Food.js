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
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "vegetables",
        "bakery",
        "cooked",
        "canned",
        "dairy",
        "grains",
        "other",
      ],
      default: "other",
    },
    quantity: {
      type: String,
      required: [true, "Quantity is required"],
      trim: true,
      // e.g., "10kg", "20 items", "5 servings"
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor is required"],
    },

    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates are required"],
        index: "2dsphere",
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {

        validator: function (value) {
          return value > new Date();

        },
        message: "Expiry date must be in the future",
      },
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String, // for cloudinary
        alt: String,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },

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
    dietaryInfo: {
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isHalal: { type: Boolean, default: false },
      isKosher: { type: Boolean, default: false },
      allergens: [String], // e.g., ["nuts", "dairy", "gluten"]
    },
    pickupInstructions: {
      type: String,
      maxlength: [300, "Pickup instructions cannot exceed 300 characters"],
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableUntil: {
      type: Date,
      required: true,
    },
    // For tracking requests
    totalRequests: {
      type: Number,
      default: 0,
    },
    // For ratings
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {

      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);


// Indexes
foodSchema.index({ donor: 1 });
foodSchema.index({ status: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ "location.coordinates": "2dsphere" });
foodSchema.index({ createdAt: -1 });
foodSchema.index({ expiryDate: 1 });

// Virtual for time remaining
foodSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day";
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
});

// Virtual for posted time
foodSchema.virtual("postedTime").get(function () {
  const now = new Date();
  const posted = new Date(this.createdAt);
  const diffTime = now - posted;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
});

// Method to calculate distance from given coordinates
foodSchema.methods.calculateDistance = function (lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat - this.location.coordinates[1]) * Math.PI) / 180;
  const dLng = ((lng - this.location.coordinates[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.location.coordinates[1] * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance.toFixed(1)}km`;
};

// Ensure virtual fields are included in JSON output
foodSchema.set("toJSON", { virtuals: true });
foodSchema.set("toObject", { virtuals: true });


module.exports = mongoose.model("Food", foodSchema);
