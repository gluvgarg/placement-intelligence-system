
import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AnimatePresence, motion } from "motion/react";
import { LogOut, Menu, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isStudent,
    loading,
    logout,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const isAuthPage = [
    "/login",
    "/register",
  ].includes(location.pathname);

  const firstName =
    user?.fullname?.trim().split(/\s+/)[0] || "Account";

  // Navigation links according to user role
  const navItems = isAdmin
    ? [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Companies", path: "/admin/companies" },
        { label: "Jobs", path: "/admin/jobs" },
        { label: "Applications", path: "/admin/applications" },
      ]
    : isStudent
    ? [
        { label: "Dashboard", path: "/student/dashboard" },
        { label: "Jobs", path: "/student/jobs" },
        { label: "Applications", path: "/student/applications" },
        { label: "Profile", path: "/student/profile" },
      ]
    : [];

  // Handle logout
  const handleLogout = async () => {
    setLogoutError("");
    setMenuOpen(false);

    try {
      await logout();

      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(
        error.message || "Unable to logout. Please try again."
      );
    }
  };

  // Navigation link styling
  const getLinkClass = ({ isActive }) =>
    `relative py-2 text-large font-medium transition-colors duration-200
    ${
      isActive
        ? "text-[#EAF0F2]"
        : "text-[#AAB7C2] hover:text-white"
    }`;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 w-full
      border-b border-[#354652]/50
      bg-[#0B1118]/90 backdrop-blur-xl"
    >

      <nav
        className="mx-auto flex h-[76px] max-w-[1600px]
        items-center justify-between px-6 md:px-12 lg:px-16"
      >

        {/* Brand */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center gap-3"
        >
          <img
            src="/placement-logo.svg"
            alt="Placement Intelligence"
            className="h-10 w-10 object-contain"
          />

          <span className="text-base font-semibold
          tracking-tight text-[#E7EDF1] sm:text-[17px]">
            Placement Intelligence
          </span>
        </Link>

        {/* Desktop Navigation - Authenticated Users */}
        {isAuthenticated && (
          <div className="hidden items-center gap-7 lg:flex">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={getLinkClass}
                end={item.path.endsWith("dashboard")}
              >
                {({ isActive }) => (
                  <>
                    {item.label}

                    {isActive && (
                      <motion.span
                        layoutId="navbar-underline"
                        className="absolute -bottom-1 left-0
                        h-[2px] w-full rounded-full
                        bg-[#5B9295]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

          </div>
        )}

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-6 md:flex">

          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-white/10" />
          ) : isAuthenticated ? (

            <>
              {/* User Information */}
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center
                justify-center rounded-full border
                border-[#5B9295]/50 bg-[#5B9295]/15
                text-sm font-semibold text-[#A5C3C6]">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#E1E7EB]">
                    {firstName}
                  </span>

                  <span className="text-[10px] font-medium
                  tracking-wider text-[#8796A2]">
                    {isAdmin ? "ADMINISTRATOR" : "STUDENT"}
                  </span>
                </div>

              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2
                rounded-lg border border-[#455967]
                px-4 py-2.5 text-sm font-medium
                text-[#C5D0D6] transition-all
                hover:border-red-400/50
                hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>

          ) : isAuthPage ? (

            <Link
              to="/"
              className="text-sm font-medium text-[#AAB7C2]
              transition-colors hover:text-white"
            >
              ← Back to Home
            </Link>

          ) : (

            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#B8C2CB]
                transition-colors hover:text-white"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="group flex items-center gap-3
                rounded-lg bg-[#5B9295] px-6 py-3
                text-sm font-semibold text-[#101820]
                transition-colors duration-300
                hover:bg-[#70A5A5]"
              >
                Get Started

                <span className="transition-transform duration-200
                group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </>

          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center
          justify-center rounded-lg border
          border-[#354652] text-[#E1E7EB]
          transition hover:bg-white/5 md:hidden"
        >
          {menuOpen
            ? <X size={21} />
            : <Menu size={21} />
          }
        </button>

      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t
            border-[#354652]/50 bg-[#111820]/[0.98]
            backdrop-blur-xl md:hidden"
          >

            <div className="flex flex-col gap-2 px-6 py-5">

              {/* Authenticated Navigation */}
              {isAuthenticated && (
                <>
                  <div className="mb-3 flex items-center gap-3
                  border-b border-white/10 pb-4">

                    <div className="flex h-10 w-10
                    items-center justify-center rounded-full
                    bg-[#5B9295]/20 font-semibold text-[#A5C3C6]">
                      {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user?.fullname}
                      </p>

                      <p className="text-xs text-[#8796A2]">
                        {isAdmin ? "Administrator" : "Student"}
                      </p>
                    </div>

                  </div>

                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path.endsWith("dashboard")}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `rounded-lg px-4 py-3 text-sm font-medium
                        transition-colors ${
                          isActive
                            ? "bg-[#5B9295]/15 text-[#A9CECE]"
                            : "text-[#B8C2CB] hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <div className="my-2 border-t border-white/10" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3
                    rounded-lg px-4 py-3 text-sm font-medium
                    text-red-300 transition hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </>
              )}

              {/* Guest Navigation */}
              {!loading && !isAuthenticated && (
                <>
                  {isAuthPage ? (
                    <Link
                      to="/"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-4 py-3
                      text-sm font-medium text-[#C5D0D6]
                      hover:bg-white/5"
                    >
                      ← Back to Home
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg px-4 py-3
                        text-sm font-medium text-[#C5D0D6]
                        hover:bg-white/5"
                      >
                        Sign In
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg bg-[#5B9295] px-4 py-3
                        text-center text-sm font-semibold
                        text-[#101820] hover:bg-[#70A5A5]"
                      >
                        Get Started →
                      </Link>
                    </>
                  )}
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Error */}
      {logoutError && (
        <div className="absolute right-4 top-full mt-2
        rounded-lg border border-red-500/30
        bg-[#1C2933] px-4 py-3 text-sm text-red-300">
          {logoutError}
        </div>
      )}

    </header>
  );
};

export default Navbar;
