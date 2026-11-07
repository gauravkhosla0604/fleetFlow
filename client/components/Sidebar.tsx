"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-gray-900 p-4 text-white">
      <div className="mb-8 text-2xl font-bold tracking-wider">FleetFlow</div>
      
      <nav className="flex flex-1 flex-col gap-2">
        <Link href="/dashboard" className="rounded p-2 hover:bg-gray-800">
          Dashboard
        </Link>
        <Link href="/dashboard/vehicles" className="rounded p-2 hover:bg-gray-800">
          Vehicles
        </Link>
        <Link href="/dashboard/drivers" className="rounded p-2 hover:bg-gray-800">
          Drivers
        </Link>
        <Link href="/dashboard/trips" className="rounded p-2 hover:bg-gray-800">
          Trips
        </Link>
      </nav>

      <button 
        onClick={logout}
        className="mt-auto w-full rounded bg-red-600 p-2 text-center font-semibold hover:bg-red-700"
      >
        Logout
      </button>
    </aside>
  );
}
const adminNav = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Vehicles", href: "/dashboard/vehicles" },
  { name: "Drivers", href: "/dashboard/drivers" },
  { name: "Trips", href: "/dashboard/trips" },
  { name: "Fuel & Expenses", href: "/dashboard/fuel" },
];