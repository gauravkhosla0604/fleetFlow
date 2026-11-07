"use client";

import { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

interface StatsData {
  vehicles: { total: number; available: number; onTrip: number };
  drivers: { total: number; available: number; assigned: number };
  trips: { total: number; active: number; completed: number };
  totalDistance: number;
  costs: { operating: number; fuel: number; maintenance: number };
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard metrics", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header & Refresh */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span> ({user?.role})
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
        >
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Vehicles Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Fleet Vehicles</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
              Total
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? "..." : stats?.vehicles.total}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Available: <strong className="text-green-600">{stats?.vehicles.available || 0}</strong></span>
            <span>On Trip: <strong className="text-amber-600">{stats?.vehicles.onTrip || 0}</strong></span>
          </div>
        </div>

        {/* Drivers Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Active Drivers</span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
              Fleet
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? "..." : stats?.drivers.total}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Available: <strong className="text-green-600">{stats?.drivers.available || 0}</strong></span>
            <span>Assigned: <strong className="text-blue-600">{stats?.drivers.assigned || 0}</strong></span>
          </div>
        </div>

        {/* Active Trips Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Active Trips</span>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
              In Progress
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? "..." : stats?.trips.active}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Completed: <strong className="text-gray-700">{stats?.trips.completed || 0}</strong></span>
            <span>Total Scheduled: <strong>{stats?.trips.total || 0}</strong></span>
          </div>
        </div>

        {/* Total Distance Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Fleet Coverage</span>
            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-600">
              Distance
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? "..." : `${stats?.totalDistance.toLocaleString()} km`}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Logged Distance</span>
            <span className="text-purple-600 font-medium">Cumulative</span>
          </div>
        </div>
        {/* Total Operating Cost Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Operating Cost</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              Expenses
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? "..." : `$${stats?.costs?.operating.toLocaleString() || 0}`}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Fuel: <strong>${stats?.costs?.fuel || 0}</strong></span>
            <span>Maintenance: <strong>${stats?.costs?.maintenance || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}