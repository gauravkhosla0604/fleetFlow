"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axios";

interface DriverData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status?: string;
}

const ITEMS_PER_PAGE = 5;

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, complianceFilter]);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/drivers");
      const data = response.data;

      if (Array.isArray(data)) {
        setDrivers(data);
      } else if (data && Array.isArray(data.drivers)) {
        setDrivers(data.drivers);
      } else if (data && Array.isArray(data.data)) {
        setDrivers(data.data);
      } else {
        setDrivers([]);
      }
    } catch (error) {
      console.error("Failed to fetch drivers", error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseCompliance = (expiryDate: string) => {
    if (!expiryDate) return { status: "unknown", label: "N/A", color: "bg-gray-100 text-gray-700" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", label: "Expired", color: "bg-red-100 text-red-700 border border-red-300" };
    } else if (diffDays <= 30) {
      return { status: "expiring_soon", label: `Expires in ${diffDays}d`, color: "bg-amber-100 text-amber-800 border border-amber-300" };
    }
    return { status: "valid", label: "Valid", color: "bg-green-100 text-green-700" };
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      await api.post("/drivers", { name, email, phone, licenseNumber, licenseExpiry });
      setShowModal(false);
      setName("");
      setEmail("");
      setPhone("");
      setLicenseNumber("");
      setLicenseExpiry("");
      fetchDrivers();
    } catch (error: any) {
      console.error("Failed to add driver", error);
      if (error.response?.status === 403) {
        setFormError("Access denied. Admin privileges required to add drivers.");
      } else {
        setFormError(error.response?.data?.message || "Error adding driver.");
      }
    }
  };

  // Filter Logic
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = d.status || "available";
    const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

    const compliance = getLicenseCompliance(d.licenseExpiry);
    const matchesCompliance =
      complianceFilter === "all" || compliance.status === complianceFilter;

    return matchesSearch && matchesStatus && matchesCompliance;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE) || 1;
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Drivers Management</h1>
        <button
          onClick={() => { setFormError(""); setShowModal(true); }}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Add Driver
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-1 flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name, email, license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
          </select>
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="rounded border border-gray-300 p-2 text-sm text-gray-900 focus:outline-none"
          >
            <option value="all">All License States</option>
            <option value="valid">Valid</option>
            <option value="expiring_soon">Expiring Soon (&le; 30d)</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing <strong>{filteredDrivers.length}</strong> driver(s)
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add New Driver</h2>

            {formError && (
              <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full rounded border border-gray-400 p-2 text-gray-900 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Expiry Date</label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
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
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">License Number</th>
              <th className="p-4 font-semibold">License Expiry</th>
              <th className="p-4 font-semibold">Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : paginatedDrivers.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No drivers found.</td></tr>
            ) : (
              paginatedDrivers.map((driver) => {
                const compliance = getLicenseCompliance(driver.licenseExpiry);
                return (
                  <tr key={driver._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{driver.name}</td>
                    <td className="p-4 text-gray-900">{driver.email}</td>
                    <td className="p-4 text-gray-900">{driver.licenseNumber}</td>
                    <td className="p-4 text-gray-900">
                      {driver.licenseExpiry
                        ? new Date(driver.licenseExpiry).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${compliance.color}`}>
                        {compliance.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredDrivers.length > ITEMS_PER_PAGE && (
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