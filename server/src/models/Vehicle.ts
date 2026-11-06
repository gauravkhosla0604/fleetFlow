import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["car", "van", "truck", "bike"],
    },

    status: {
      type: String,
      enum: ["available", "on_trip", "maintenance", "inactive"],
      default: "available",
    },

    currentMileage: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastServiceMileage: {
      type: Number,
      default: 0,
      min: 0,
    },

    nextServiceMileage: {
      type: Number,
      default: 10000,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;