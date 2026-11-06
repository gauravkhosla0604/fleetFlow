import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    serviceDate: { type: Date, required: true },
    cost: { type: Number, required: true },
    notes: { type: String, required: true },
    odometerReading: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);