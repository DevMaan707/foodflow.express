const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
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
    requestedQuantity: {
      value: {
        type: Number,
        required: [true, "Requested quantity is required"],
        min: [1, "Quantity must be at least 1"],
      },
      unit: {
        type: String,
        required: [true, "Quantity unit is required"],
      },
    },
    message: {
      type: String,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "picked_up",
        "cancelled",
        "expired",
      ],
      default: "pending",
    },
    response: {
      message: {
        type: String,
        maxlength: [500, "Response message cannot exceed 500 characters"],
      },
      respondedAt: {
        type: Date,
      },
    },
    scheduledPickupTime: {
      type: Date,
    },
    actualPickupTime: {
      type: Date,
    },
    pickupNotes: {
      type: String,
      maxlength: [300, "Pickup notes cannot exceed 300 characters"],
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      },
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.index({ food: 1 });
requestSchema.index({ requester: 1 });
requestSchema.index({ donor: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ expiresAt: 1 });

requestSchema.index({ donor: 1, status: 1 });
requestSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model("Request", requestSchema);
