const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
    },
    reportType: {
      type: String,
      enum: ["food_issue", "user_behavior", "technical_issue", "spam", "other"],
      required: [true, "Report type is required"],
    },
    targetType: {
      type: String,
      enum: ["food", "user", "request"],
      required: [true, "Target type is required"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
      refPath: function () {
        if (this.targetType === "food") return "Food";
        if (this.targetType === "user") return "User";
        if (this.targetType === "request") return "Request";
      },
    },
    title: {
      type: String,
      required: [true, "Report title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Report description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    attachments: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "dismissed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolution: {
      action: {
        type: String,
        enum: [
          "no_action",
          "warning_issued",
          "content_removed",
          "user_suspended",
          "user_banned",
        ],
      },
      notes: {
        type: String,
        maxlength: [500, "Resolution notes cannot exceed 500 characters"],
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ reporter: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ severity: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
