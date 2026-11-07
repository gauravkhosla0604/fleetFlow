"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axios";

interface Driver {
  _id: string;
  name: string;
  status: string;
}

interface Vehicle {
  _id: string;
  registrationNumber: string;
  model: string;
  status: string;
}

interface TripData {
  _id: string;
  source: string;
  destination: string;
  driverId: Driver | string;
  vehicleId: Vehicle | string;
  distance: number;
  scheduledDate: string;
  status?: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [distance, setDistance] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get("/trips");
      const data = response.data;

      if (Array.isArray(data)) {
        setTrips(data);
      } else if (data && Array.isArray(data.trips)) {
        setTrips(data.trips);
      } else if (data && Array.isArray(data.data)) {
        setTrips(data.data);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error("Failed to fetch trips", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setFormError("");
    setShowModal(true);

    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        api.get("/drivers"),
        api.get("/vehicles"),
      ]);

      const driversList = Array.isArray(driversRes.data)
        ? driversRes.data
        : driversRes.data.drivers || [];

      const vehiclesList = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data.vehicles || [];

      const freeDrivers = driversList.filter(
        (d: Driver) => !d.status || d.status === "available"
      );
      const freeVehicles = vehiclesList.filter(
        (v: Vehicle) => v.status === "available"
      );

      setAvailableDrivers(freeDrivers);
      setAvailableVehicles(freeVehicles);

      if (freeDrivers.length > 0) setDriverId(freeDrivers[0]._id);
      if (freeVehicles.length > 0) setVehicleId(freeVehicles[0]._id);
    } catch (error) {
      console.error("Failed to load options for trip creation", error);
      setFormError("Failed to load available drivers or vehicles.");
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      await api.post("/trips", {
        source,
        destination,
        driverId,
        vehicleId,
        distance: Number(distance),
        scheduledDate,
      });

      setShowModal(false);
      setSource("");
      setDestination("");
      setDriverId("");
      setVehicleId("");
      setDistance("");
      setScheduledDate("");
      fetchTrips();
    } catch (error: any) {
      console.error("Failed to create trip", error);
      if (error.response?.status === 403) {
        setFormError("Access denied. Admin privileges required.");
      } else {
        setFormError(error.response?.data?.message || "Error creating trip.");
      }
    }
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    try {
      await api.patch(`/trips/${tripId}/status`, { status: newStatus });
      fetchTrips();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating trip status.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Trips</h1>
        <button
          onClick={openAddModal}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Schedule Trip
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Schedule New Trip</h2>

            {formError && (
              <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Source Location</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Driver</label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                >
                  {availableDrivers.length === 0 ? (
                    <option value="">No available drivers</option>
                  ) : (
                    availableDrivers.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                >
                  {availableVehicles.length === 0 ? (
                    <option value="">No available vehicles</option>
                  ) : (
                    availableVehicles.map((v) => (
                      <option key={v._id} value={v._id}>{v.registrationNumber} ({v.model})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                <input
                  type="number"
                  min="1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!driverId || !vehicleId}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Save Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-4 font-semibold">Route</th>
              <th className="p-4 font-semibold">Driver</th>
              <th className="p-4 font-semibold">Vehicle</th>
              <th className="p-4 font-semibold">Distance</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : !Array.isArray(trips) || trips.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No trips scheduled.</td></tr>
            ) : (
              trips.map((trip) => {
                const currentStatus = trip.status || "scheduled";
                return (
                  <tr key={trip._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">
                      {trip.source} &rarr; {trip.destination}
                    </td>
                    <td className="p-4 text-gray-900">
                      {typeof trip.driverId === "object" ? trip.driverId.name : trip.driverId}
                    </td>
                    <td className="p-4 text-gray-900">
                      {typeof trip.vehicleId === "object"
                        ? `${trip.vehicleId.registrationNumber} (${trip.vehicleId.model})`
                        : trip.vehicleId}
                    </td>
                    <td className="p-4 text-gray-900">{trip.distance} km</td>
                    <td className="p-4 capitalize">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        currentStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : currentStatus === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {currentStatus === "scheduled" || currentStatus === "in_progress" ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(trip._id, "completed")}
                            className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(trip._id, "cancelled")}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}