"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axios";

interface VehicleData {
  _id: string;
  registrationNumber: string;
  model: string;
  type: string;
  status: string;
  currentMileage: number;
}

const ITEMS_PER_PAGE = 5;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [formError, setFormError] = useState("");

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // New Vehicle Form State
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("van");

  // Maintenance Form State
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [serviceDate, setServiceDate] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [odometerReading, setOdometerReading] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      const data = response.data;

      if (Array.isArray(data)) {
        setVehicles(data);
      } else if (data && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      } else if (data && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      await api.post("/vehicles", { registrationNumber, model, type });
      setShowAddModal(false);
      setRegistrationNumber("");
      setModel("");
      fetchVehicles();
    } catch (error: any) {
      console.error("Failed to add vehicle", error);
      if (error.response?.status === 403) {
        setFormError("Access denied. Admin privileges required to add vehicles.");
      } else {
        setFormError(error.response?.data?.message || "Error adding vehicle.");
      }
    }
  };

  const openMaintenanceModal = (vehicle: VehicleData) => {
    setSelectedVehicle(vehicle);
    setServiceDate(new Date().toISOString().split("T")[0]);
    setCost("");
    setNotes("");
    setOdometerReading(String(vehicle.currentMileage || 0));
    setFormError("");
    setShowMaintModal(true);
  };

  const handleSendToMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setFormError("");

    try {
      await api.post("/maintenance", {
        vehicleId: selectedVehicle._id,
        serviceDate,
        cost: Number(cost),
        notes,
        odometerReading: Number(odometerReading),
      });

      setShowMaintModal(false);
      fetchVehicles();
    } catch (error: any) {
      console.error("Failed to log maintenance", error);
      setFormError(error.response?.data?.message || "Error logging maintenance.");
    }
  };

  const handleCompleteMaintenance = async (vehicleId: string) => {
    try {
      await api.patch(`/maintenance/${vehicleId}/complete`);
      fetchVehicles();
    } catch (error) {
      console.error("Failed to complete maintenance", error);
      alert("Error completing maintenance.");
    }
  };

  // Filter Logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE) || 1;
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Vehicles</h1>
        <button
          onClick={() => { setFormError(""); setShowAddModal(true); }}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-1 gap-4">
          <input
            type="text"
            placeholder="Search by registration or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing <strong>{filteredVehicles.length}</strong> vehicle(s)
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add New Vehicle</h2>

            {formError && (
              <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                >
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Send to Maintenance</h2>
            <p className="mb-4 text-xs text-gray-500">
              Vehicle: <strong>{selectedVehicle.registrationNumber}</strong> ({selectedVehicle.model})
            </p>

            {formError && (
              <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSendToMaintenance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Odometer Reading (km)</label>
                <input
                  type="number"
                  min="0"
                  value={odometerReading}
                  onChange={(e) => setOdometerReading(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Notes / Issues Resolved</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  placeholder="e.g., Oil change, brake pad replacement..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700"
                >
                  Confirm Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-4 font-semibold">Registration</th>
              <th className="p-4 font-semibold">Model</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Mileage</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : paginatedVehicles.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No vehicles found.</td></tr>
            ) : (
              paginatedVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium uppercase text-gray-900">{vehicle.registrationNumber}</td>
                  <td className="p-4 text-gray-900">{vehicle.model}</td>
                  <td className="p-4 capitalize text-gray-900">{vehicle.type}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                      vehicle.status === "available"
                        ? "bg-green-100 text-green-700"
                        : vehicle.status === "on_trip"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {vehicle.status ? vehicle.status.replace("_", " ") : "available"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-900">{vehicle.currentMileage ? vehicle.currentMileage.toLocaleString() : 0} km</td>
                  <td className="p-4">
                    {vehicle.status === "available" && (
                      <button
                        onClick={() => openMaintenanceModal(vehicle)}
                        className="rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        Maintenance
                      </button>
                    )}
                    {vehicle.status === "maintenance" && (
                      <button
                        onClick={() => handleCompleteMaintenance(vehicle._id)}
                        className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Complete Service
                      </button>
                    )}
                    {vehicle.status === "on_trip" && (
                      <span className="text-xs text-gray-400">On Active Trip</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredVehicles.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t p-4 text-sm text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}