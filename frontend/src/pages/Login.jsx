
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(
    location.state?.registrationSuccess || ""
  );

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Handle login submission
  const submitLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    setLoading(true);

    try {
      // Authenticate through AuthContext
      await login(formData);

      // Clear form after successful login
      setFormData({
        email: "",
        password: "",
      });

      // Navigate to homepage
      navigate("/", { replace: true });

    } catch (err) {
      setError(
        err.message || "Login failed. Please check your credentials."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
    bg-[#111820] px-4 pt-24 pb-12">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md"
      >

        {/* Back to Home */}
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2
          text-sm font-medium text-[#91AFC0]
          transition-colors hover:text-white"
        >
          <span>←</span>
          Back to Home
        </Link>

        <form
          onSubmit={submitLogin}
          className="w-full rounded-2xl
          border border-[#354652] bg-[#1C2933]
          p-8 shadow-2xl"
        >

          {/* Heading */}
          <div className="mb-8 text-center">

            <h1 className="text-3xl font-bold text-[#F0F3F5]">
              Welcome Back
            </h1>

            <p className="mt-2 text-[#AAB7C2]">
              Sign in to continue your career journey.
            </p>

          </div>

          {/* Registration Success Message */}
          {success && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-[#5B9295]/40
              bg-[#5B9295]/10 p-3 text-sm text-[#A9D1D0]"
            >
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/30
              bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-6">

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#D5DEE4]"
            >
              Email Address
            </label>

            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sample@gmail.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-[#455967]
              bg-[#111820] p-3 text-white outline-none
              placeholder:text-[#71808C]
              focus:border-[#5B9295] focus:ring-1
              focus:ring-[#5B9295] transition"
            />

          </div>

          {/* Password */}
          <div className="mb-7">

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#D5DEE4]"
            >
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[#455967]
                bg-[#111820] p-3 pr-12 text-white outline-none
                placeholder:text-[#71808C]
                focus:border-[#5B9295] focus:ring-1
                focus:ring-[#5B9295] transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2
                -translate-y-1/2 text-[#8796A2]
                transition hover:text-[#E1E7EB]"
              >
                {showPassword
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
                }
              </button>

            </div>

          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5B9295]
            py-3 font-semibold text-[#101820]
            transition duration-300 hover:bg-[#70A5A5]
            disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Register Option */}
          <p className="mt-7 text-center text-sm text-[#AAB7C2]">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-[#91AFC0]
              transition-colors hover:text-white"
            >
              Create Account
            </Link>

          </p>

        </form>

      </motion.div>

    </div>
  );
};

export default Login;
