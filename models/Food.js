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
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor is required"],
    },
    status: {
      type: String,
      enum: ["available", "reserved", "picked_up", "expired", "cancelled"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

foodSchema.index({ donor: 1 });
foodSchema.index({ status: 1 });
foodSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Food", foodSchema);
