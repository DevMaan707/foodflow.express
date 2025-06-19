const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
    },
    userType: {
      type: String,
      enum: ["donor", "receiver", "admin"],
      required: [true, "User type is required"],
      default: "donor",
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    profileImage: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    organizationName: {
      type: String,
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    organizationType: {
      type: String,
      enum: ["ngo", "charity", "food_bank", "community_center", "other"],
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.userType === "receiver" ? "pending" : "approved";
      },
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },

    // Organization/Business details (for donors and receivers)
    organizationName: {
      type: String,
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    organizationType: {
      type: String,
      enum: [
        "restaurant",
        "grocery_store",
        "bakery",
        "catering",
        "ngo",
        "charity",
        "food_bank",
        "other",
      ],
    },
    organizationDescription: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Address information
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    // Profile information
    profileImage: {
      url: String,
      publicId: String,
    },

    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocument: {
      type: String, // URL to uploaded document
    },

    // Rating system
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

    // Activity tracking
    totalDonations: {
      type: Number,
      default: 0,
    },
    totalReceived: {
      type: Number,
      default: 0,
    },

    // Notification preferences
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      newFoodPosts: {
        type: Boolean,
        default: true,
      },
      requestUpdates: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: false,
      },
    },

    // Operating hours for donors
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },

    isActive: {
      type: Boolean,
      default: true,
    },


    // For password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Last login tracking
    lastLogin: {
      type: Date,
      default: Date.now,

    },
  },
  {
    timestamps: true,
  },
);


// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (organization name or full name)
userSchema.virtual("displayName").get(function () {
  return this.organizationName || this.fullName;
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Method to update rating
userSchema.methods.updateRating = function (newRating) {
  const totalScore = this.averageRating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.averageRating = totalScore / this.totalRatings;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ "address.coordinates": "2dsphere" });
userSchema.index({ isVerified: 1 });
userSchema.index({ averageRating: -1 });

// Ensure virtual fields are included in JSON output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });


module.exports = mongoose.model("User", userSchema);
