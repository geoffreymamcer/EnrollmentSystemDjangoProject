import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import BASE_URL from "../api/base_url";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const requirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(formData.password) },
    {
      text: "Contains a special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    },
    {
      text: "Passwords match",
      met:
        formData.password.length > 0 &&
        formData.password === formData.confirmPassword,
    },
  ];

  const isFormValid =
    requirements.every((req) => req.met) && formData.username && formData.email;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const firstError = Object.values(data)[0] as string[];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Registration failed"
        );
      }

      navigate("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-slate-900 via-primary-900/50 to-black z-0"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[80px]"></div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join Us Today!
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Create an account to start start your education and career journey
            with our state-of-the-art tools. Secure, fast, and intuitive.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-slate-400 text-sm">Students Graduated</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-bold">90%</div>
              <div className="text-slate-400 text-sm">Average Passing Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-slate-500">
              Get started with your free admin account.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="name@institution.edu"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10 ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                      req.met
                        ? "text-emerald-600 font-bold"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    <div
                      className={`
                      w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300
                      ${
                        req.met
                          ? "bg-emerald-100 border-emerald-200 scale-110"
                          : "bg-transparent border-slate-300"
                      }
                    `}
                    >
                      {req.met && (
                        <Check
                          size={10}
                          strokeWidth={3}
                          className="text-emerald-600"
                        />
                      )}
                    </div>
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-slate-700">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="group w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
