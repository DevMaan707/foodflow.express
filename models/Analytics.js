const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    foodStats: {
      totalPosted: {
        type: Number,
        default: 0,
      },
      totalDonated: {
        type: Number,
        default: 0,
      },
      totalExpired: {
        type: Number,
        default: 0,
      },
      byCategory: {
        type: Map,
        of: Number,
        default: {},
      },
      totalQuantity: {
        type: Number,
        default: 0,
      },
      totalValue: {
        type: Number,
        default: 0,
      },
    },
    userStats: {
      totalUsers: {
        type: Number,
        default: 0,
      },
      newUsers: {
        type: Number,
        default: 0,
      },
      activeUsers: {
        type: Number,
        default: 0,
      },
      byType: {
        donors: {
          type: Number,
          default: 0,
        },
        receivers: {
          type: Number,
          default: 0,
        },
      },
      pendingApprovals: {
        type: Number,
        default: 0,
      },
    },
    requestStats: {
      totalRequests: {
        type: Number,
        default: 0,
      },
      approvedRequests: {
        type: Number,
        default: 0,
      },
      rejectedRequests: {
        type: Number,
        default: 0,
      },
      completedPickups: {
        type: Number,
        default: 0,
      },
      avgResponseTime: {
        type: Number,
        default: 0,
      },
    },
    locationStats: {
      topCities: [
        {
          city: String,
          count: Number,
        },
      ],
      topStates: [
        {
          state: String,
          count: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

analyticsSchema.index({ date: -1 });
analyticsSchema.index({ period: 1, date: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
