const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: [true, "Food item is required"],
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: [true, "Original request is required"],
    },
    bookingId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return (
          "BK" +
          Date.now() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
      },
    },
    confirmedQuantity: {
      value: {
        type: Number,
        required: [true, "Confirmed quantity is required"],
        min: [0.1, "Quantity must be positive"],
      },
      unit: {
        type: String,
        required: [true, "Quantity unit is required"],
      },
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: [
        "confirmed",
        "scheduled",
        "in_transit",
        "completed",
        "cancelled",
        "no_show",
        "expired",
      ],
      default: "confirmed",
    },
    scheduledPickup: {
      date: {
        type: Date,
        required: [true, "Pickup date is required"],
      },
      timeSlot: {
        start: {
          type: String,
          required: [true, "Pickup start time is required"],
        },
        end: {
          type: String,
          required: [true, "Pickup end time is required"],
        },
      },
    },
    completion: {
      pickedUpAt: {
        type: Date,
      },
      actualQuantity: {
        value: {
          type: Number,
        },
        unit: {
          type: String,
        },
      },
      pickedUpBy: {
        name: {
          type: String,
        },
        phone: {
          type: String,
        },
        idProof: {
          type: String,
        },
      },
      donorNotes: {
        type: String,
        maxlength: [500, "Donor notes cannot exceed 500 characters"],
      },
      receiverNotes: {
        type: String,
        maxlength: [500, "Receiver notes cannot exceed 500 characters"],
      },
    },
    payment: {
      method: {
        type: String,
        enum: ["cash", "upi", "card", "free"],
        default: "free",
      },
      transactionId: {
        type: String,
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded", "not_required"],
        default: "not_required",
      },
      paidAt: {
        type: Date,
      },
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, "Pickup address is required"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      landmarks: {
        type: String,
      },
    },
    specialInstructions: {
      type: String,
      maxlength: [1000, "Special instructions cannot exceed 1000 characters"],
    },
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: {
        type: String,
        maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
      },
      cancelledAt: {
        type: Date,
      },
    },
    feedback: {
      donorRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      receiverRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      donorReview: {
        type: String,
        maxlength: [500, "Review cannot exceed 500 characters"],
      },
      receiverReview: {
        type: String,
        maxlength: [500, "Review cannot exceed 500 characters"],
      },
    },
    metrics: {
      responseTime: {
        type: Number,
      },
      fulfillmentTime: {
        type: Number,
      },
      foodSavedWeight: {
        type: Number,
      },
      impactScore: {
        type: Number,
      },
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 48 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ food: 1 });
bookingSchema.index({ donor: 1, createdAt: -1 });
bookingSchema.index({ receiver: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ "scheduledPickup.date": 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ expiresAt: 1 });
bookingSchema.index({ donor: 1, status: 1 });
bookingSchema.index({ receiver: 1, status: 1 });
bookingSchema.index({ status: 1, "scheduledPickup.date": 1 });

bookingSchema.virtual("ageInHours").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

module.exports = mongoose.model("Booking", bookingSchema);
