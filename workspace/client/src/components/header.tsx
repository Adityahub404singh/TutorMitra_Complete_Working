import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("tm_token");
  const username = localStorage.getItem("userName") || "User";

  const headerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("userName");
    setMenuOpen(false);
    navigate("/login");
  };

  const commonLinks = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    { to: "/tutors", label: "Tutors" },
  ];

  // Removed Dashboard from authLinks
  const authLinks = [
    { to: "/my-bookings", label: "My Bookings" },
  ];

  return (
    <header
      className="bg-primary text-white sticky top-0 z-50 shadow-lg backdrop-blur-md bg-opacity-90 rounded-b-xl font-heading"
      ref={headerRef}
      role="banner"
    >
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-accent">
        <button
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-3xl bg-background text-primary hover:text-accent focus:outline-none rounded z-30 transition-colors duration-300"
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <button
          onClick={() => navigate("/")}
          aria-label="Go to TutorMitra Home"
          className="bg-accent text-primary font-extrabold text-2xl px-8 py-2 rounded shadow-md hover:shadow-lg transition duration-300 tracking-wider"
        >
          TutorMitra
        </button>
      </div>

      {/* Logo & Brand desktop */}
      <div className="hidden md:flex items-center justify-between py-5 px-10 max-w-7xl mx-auto">
        <div className="flex items-center space-x-6 cursor-pointer select-none" onClick={() => navigate("/")}>
          <img
            src="/logo.png"
            alt="TutorMitra Logo"
            draggable={false}
            className="w-32 h-32 object-contain rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
          />
          <div>
            <h1 className="text-background font-extrabold text-4xl leading-tight drop-shadow-md tracking-wide">
              TutorMitra
            </h1>
            <p className="text-background/90 text-lg mt-1 font-semibold max-w-md drop-shadow-sm">
              Find Your Perfect Teacher for Offline Coaching
            </p>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav
          className="flex items-center space-x-10 text-background font-medium select-none"
          aria-label="Primary navigation"
        >
          {commonLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-3 py-2 transition-all ${
                location.pathname === to
                  ? "text-accent underline underline-offset-8 font-semibold"
                  : "hover:text-accent rounded-md"
              }`}
            >
              {label}
              {location.pathname === to && (
                <span className="absolute -bottom-2 left-0 w-full border-b-4 border-accent rounded-sm"></span>
              )}
            </Link>
          ))}

          {token &&
            authLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-3 py-2 transition-all ${
                  location.pathname === to
                    ? "text-accent underline underline-offset-8 font-semibold"
                    : "hover:text-accent rounded-md"
                }`}
              >
                {label}
                {location.pathname === to && (
                  <span className="absolute -bottom-2 left-0 w-full border-b-4 border-accent rounded-sm"></span>
                )}
              </Link>
            ))}

          {token ? (
            <>
              {/* Removed "Hi, username" greeting */}

              <Link
                to="/profile"
                className="px-3 py-2 font-semibold hover:text-accent rounded transition"
                aria-label="Profile"
                title="Profile"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="ml-6 px-5 py-2 bg-accent text-primary rounded font-semibold shadow-md hover:shadow-lg transition"
                aria-label="Logout"
                title="Logout"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="ml-6 px-5 py-2 font-semibold hover:text-accent rounded transition"
                aria-label="Login"
                title="Login"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="ml-3 px-5 py-2 bg-accent text-primary rounded font-semibold shadow-md hover:shadow-lg transition"
                aria-label="Sign Up"
                title="Sign Up"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      <nav
        id="mobile-menu"
        className={`md:hidden absolute top-full left-4 w-64 bg-background border border-accent shadow-xl rounded-xl py-5 px-6 z-30 transition-transform duration-300 ${
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
        role="menu"
        aria-label="Mobile navigation"
      >
        {commonLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            role="menuitem"
            className={`block px-5 py-3 font-semibold rounded-md mb-2 transition ${
              location.pathname === to ? "bg-accent text-primary font-bold" : "text-primary hover:bg-accent"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}

        {token &&
          authLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              className={`block px-5 py-3 font-semibold rounded-md mb-2 transition ${
                location.pathname === to ? "bg-accent text-primary font-bold" : "text-primary hover:bg-accent"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

        {token ? (
          <>
            <Link
              to="/profile"
              role="menuitem"
              className="block px-5 py-3 font-semibold rounded-md hover:bg-accent mb-2"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              className="w-full text-left px-5 py-3 bg-accent text-primary rounded-md font-semibold hover:bg-background transition"
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              role="menuitem"
              className="block px-5 py-3 font-semibold rounded-md hover:bg-accent mb-2"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              role="menuitem"
              className="block px-5 py-3 bg-accent text-primary rounded-md font-semibold hover:bg-background transition"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
