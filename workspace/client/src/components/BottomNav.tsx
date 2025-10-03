
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/dashboard", icon: "🏠" },
  { label: "Tutors", path: "/tutors", icon: "👨‍🏫" },
  { label: "Bookings", path: "/my-bookings", icon: "📅" },
  { label: "Payments", path: "/payments", icon: "💳" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-inner md:hidden dark:bg-gray-900 dark:border-gray-700 z-50">
      <ul className="flex justify-between max-w-md mx-auto py-2">
        {navItems.map(({ label, path, icon }) => (
          <li key={path} className="flex-1">
            <NavLink
              to={path}
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-sm px-2 py-1 ${
                  isActive
                    ? "text-blue-600 font-semibold dark:text-yellow-400"
                    : "text-gray-600 dark:text-gray-400"
                }`
              }
              aria-label={label}
            >
              <span className="text-2xl">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
