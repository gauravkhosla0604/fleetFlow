"use client";

import { useState, useEffect } from "react";
import api from "../../lib/axios";

interface Vehicle {
  _id: string;
  registrationNumber: string;
  model: string;
  type: string;
}

interface TripData {
  _id: string;
  source: string;
  destination: string;
  vehicleId: Vehicle | string;
  distance: number;
  scheduledDate: string;
  status?: string;
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
    try {
      const response = await api.get("/trips/my-trips");
      setTrips(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Failed to load driver trips", err);
      setError(err.response?.data?.message || "Failed to load assigned trips.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    try {
      await api.patch(`/trips/${tripId}/driver-status`, { status: newStatus });
      fetchMyTrips();
    } catch (err: any) {
      console.error("Failed to update status", err);
      alert(err.response?.data?.message || "Error updating trip status.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Trips</h1>
        <p className="mt-1 text-sm text-gray-500">View assigned tasks and update real-time progress.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="rounded-lg bg-white p-6 shadow-md text-center text-gray-500">
            Loading assigned trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-lg bg-white p-6 shadow-md text-center text-gray-500">
            No trips currently assigned to your account.
          </div>
        ) : (
          trips.map((trip) => {
            const vehicle = typeof trip.vehicleId === "object" ? trip.vehicleId : null;
            const status = trip.status || "scheduled";

            return (
              <div key={trip._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Route</span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {trip.source} &rarr; {trip.destination}
                    </h2>
                  </div>
                  <span className={`mt-2 sm:mt-0 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    status === "completed"
                      ? "bg-green-100 text-green-700"
                      : status === "in_progress"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm text-gray-600 mb-6">
                  <div>
                    <span className="block text-xs font-medium text-gray-400">Assigned Vehicle</span>
                    <p className="font-semibold text-gray-800">
                      {vehicle ? `${vehicle.registrationNumber} (${vehicle.model})` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-400">Trip Distance</span>
                    <p className="font-semibold text-gray-800">{trip.distance} km</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-400">Scheduled Date</span>
                    <p className="font-semibold text-gray-800">
                      {trip.scheduledDate ? new Date(trip.scheduledDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t pt-4">
                  {status === "scheduled" && (
                    <button
                      onClick={() => handleStatusUpdate(trip._id, "in_progress")}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      Start Trip
                    </button>
                  )}
                  {status === "in_progress" && (
                    <button
                      onClick={() => handleStatusUpdate(trip._id, "completed")}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {status === "completed" && (
                    <span className="text-xs font-medium text-gray-400 italic">Trip Finished</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}