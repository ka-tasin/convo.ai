import { useState } from "react";
import apiClient from "../utils/apiClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { AxiosError } from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post("/api/auth/login", form);

      // Store token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: res.data.user.id,
          username: res.data.user.username,
          email: res.data.user.email,
        })
      );

      // Set user in context with token
      setUser({
        id: res.data.user.id,
        username: res.data.user.username,
        email: res.data.user.email,
        token: res.data.token,
      });

      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <form
        className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100"
        onSubmit={handleSubmit}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
        >
          Sign In
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
