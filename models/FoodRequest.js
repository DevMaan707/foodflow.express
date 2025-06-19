const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: [true, "Food item is required"],
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor is required"],
    },
    quantityRequested: {
      type: String,
      required: [true, "Quantity requested is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [500, "Message cannot exceed 500 characters"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Additional details
    pickupTime: {
      preferred: Date,
      confirmed: Date,
    },

    // Communication
    donorResponse: {
      type: String,
      maxlength: [300, "Response cannot exceed 300 characters"],
    },

    // Completion details
    completedAt: Date,
    actualQuantityReceived: String,

    // Feedback
    requesterRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    requesterFeedback: {
      type: String,
      maxlength: [300, "Feedback cannot exceed 300 characters"],
    },
    donorRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    donorFeedback: {
      type: String,
      maxlength: [300, "Feedback cannot exceed 300 characters"],
    },

    // Tracking
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "completed", "cancelled"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
foodRequestSchema.index({ food: 1 });
foodRequestSchema.index({ requester: 1 });
foodRequestSchema.index({ donor: 1 });
foodRequestSchema.index({ status: 1 });
foodRequestSchema.index({ createdAt: -1 });

// Virtual for time since request
foodRequestSchema.virtual("requestedTime").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
});

// Method to update status
foodRequestSchema.methods.updateStatus = function (newStatus, note = "") {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note,
  });

  if (newStatus === "completed") {
    this.completedAt = new Date();
  }
};

// Ensure virtual fields are included in JSON output
foodRequestSchema.set("toJSON", { virtuals: true });
foodRequestSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("FoodRequest", foodRequestSchema);
