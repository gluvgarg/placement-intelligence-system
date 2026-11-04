
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

import { registerUser } from "../services/api.js";

const initialFormData = {
  fullname: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Handle registration submission
  const submitRegistration = async (e) => {
    e.preventDefault();

    setError("");

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      // Register user through backend API
      const response = await registerUser(formData);

      // Reset form
      setFormData(initialFormData);

      // Redirect to Login after successful registration
      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            response.message ||
            "Account created successfully! Please sign in.",
        },
      });

    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
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
        className="w-full max-w-lg"
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
          onSubmit={submitRegistration}
          className="w-full rounded-2xl
          border border-[#354652] bg-[#1C2933]
          p-8 shadow-2xl"
        >

          {/* Heading */}
          <div className="mb-8 text-center">

            <h1 className="text-3xl font-bold text-[#F0F3F5]">
              Create Account
            </h1>

            <p className="mt-2 text-[#AAB7C2]">
              Join Placement Intelligence today.
            </p>

          </div>

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

          {/* Full Name */}
          <div className="mb-5">

            <label
              htmlFor="fullname"
              className="mb-2 block text-sm font-medium text-[#D5DEE4]"
            >
              Full Name
            </label>

            <input
              type="text"
              name="fullname"
              id="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Rahul Kumar"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
              className="w-full rounded-lg border border-[#455967]
              bg-[#111820] p-3 text-white outline-none
              placeholder:text-[#71808C]
              focus:border-[#5B9295] focus:ring-1
              focus:ring-[#5B9295] transition"
            />

          </div>

          {/* Email */}
          <div className="mb-5">

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

          {/* Mobile Number */}
          <div className="mb-5">

            <label
              htmlFor="mobile"
              className="mb-2 block text-sm font-medium text-[#D5DEE4]"
            >
              Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              id="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="9999999999"
              autoComplete="tel-national"
              maxLength={10}
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              title="Enter a valid 10-digit Indian mobile number."
              required
              className="w-full rounded-lg border border-[#455967]
              bg-[#111820] p-3 text-white outline-none
              placeholder:text-[#71808C]
              focus:border-[#5B9295] focus:ring-1
              focus:ring-[#5B9295] transition"
            />

          </div>

          {/* Password */}
          <div className="mb-5">

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
                autoComplete="new-password"
                minLength={8}
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

          {/* Confirm Password */}
          <div className="mb-7">

            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[#D5DEE4]"
            >
              Confirm Password
            </label>

            <div className="relative">

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-[#455967]
                bg-[#111820] p-3 pr-12 text-white outline-none
                placeholder:text-[#71808C]
                focus:border-[#5B9295] focus:ring-1
                focus:ring-[#5B9295] transition"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2
                -translate-y-1/2 text-[#8796A2]
                transition hover:text-[#E1E7EB]"
              >
                {showConfirmPassword
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
                }
              </button>

            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5B9295]
            py-3 font-semibold text-[#101820]
            transition duration-300 hover:bg-[#70A5A5]
            disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Option */}
          <p className="mt-6 text-center text-sm text-[#AAB7C2]">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-[#91AFC0]
              transition-colors hover:text-white"
            >
              Sign In
            </Link>

          </p>

        </form>

      </motion.div>

    </div>
  );
};

export default Register;
