"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axios";

interface Vehicle {
  _id: string;
  registrationNumber: string;
  model: string;
  currentMileage: number;
}

interface FuelLogData {
  _id: string;
  vehicleId: Vehicle | string;
  date: string;
  liters: number;
  cost: number;
  odometerReading: number;
}

const ITEMS_PER_PAGE = 5;

export default function FuelPage() {
  const [fuelLogs, setFuelLogs] = useState<FuelLogData[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");

  // Search, Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [odometerReading, setOdometerReading] = useState("");

  useEffect(() => {
    fetchLogsAndVehicles();
  }, []);

  const fetchLogsAndVehicles = async () => {
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get("/fuel"),
        api.get("/vehicles"),
      ]);

      setFuelLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

      const vList = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data.vehicles || [];
      setVehicles(vList);
      if (vList.length > 0) setSelectedVehicleId(vList[0]._id);
    } catch (error) {
      console.error("Failed to fetch fuel logs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      await api.post("/fuel", {
        vehicleId: selectedVehicleId,
        date,
        liters: Number(liters),
        cost: Number(cost),
        odometerReading: Number(odometerReading),
      });

      setShowModal(false);
      setLiters("");
      setCost("");
      setOdometerReading("");
      fetchLogsAndVehicles();
    } catch (error: any) {
      console.error("Failed to add fuel log", error);
      setFormError(error.response?.data?.message || "Error saving fuel log.");
    }
  };

  const filteredLogs = fuelLogs.filter((log) => {
    const regNum =
      typeof log.vehicleId === "object" ? log.vehicleId.registrationNumber : "";
    const model = typeof log.vehicleId === "object" ? log.vehicleId.model : "";
    return (
      regNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fuel & Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">Track fuel purchases and calculate fleet efficiency.</p>
        </div>
        <button
          onClick={() => { setFormError(""); setShowModal(true); }}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Log Fuel Entry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by vehicle registration..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs rounded border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none"
        />
        <div className="text-sm text-gray-500">
          Total Logs: <strong>{filteredLogs.length}</strong>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add Fuel Log</h2>

            {formError && (
              <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddFuelLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    const found = vehicles.find((v) => v._id === e.target.value);
                    if (found) setOdometerReading(String(found.currentMileage || 0));
                  }}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.model})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Refuel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Liters Purchased</label>
                <input
                  type="number"
                  step="0.01"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cost ($)</label>
                <input
                  type="number"
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
                  value={odometerReading}
                  onChange={(e) => setOdometerReading(e.target.value)}
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
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fuel Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Vehicle</th>
              <th className="p-4 font-semibold">Fuel (Liters)</th>
              <th className="p-4 font-semibold">Cost ($)</th>
              <th className="p-4 font-semibold">Odometer</th>
              <th className="p-4 font-semibold">Avg Cost/L</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : paginatedLogs.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No fuel logs found.</td></tr>
            ) : (
              paginatedLogs.map((log) => {
                const vehicle = typeof log.vehicleId === "object" ? log.vehicleId : null;
                const costPerLiter = log.liters > 0 ? (log.cost / log.liters).toFixed(2) : "0.00";
                return (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-900">
                      {log.date ? new Date(log.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {vehicle ? `${vehicle.registrationNumber} (${vehicle.model})` : "N/A"}
                    </td>
                    <td className="p-4 text-gray-900">{log.liters} L</td>
                    <td className="p-4 font-semibold text-gray-900">${log.cost.toFixed(2)}</td>
                    <td className="p-4 text-gray-900">{log.odometerReading.toLocaleString()} km</td>
                    <td className="p-4 text-gray-900">${costPerLiter}/L</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredLogs.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t p-4 text-sm text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
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