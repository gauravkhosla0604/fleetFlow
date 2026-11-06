import mongoose from "mongoose";

const fuelLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    liters: { type: Number, required: true },
    cost: { type: Number, required: true },
    odometerReading: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FuelLog", fuelLogSchema);