import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
} from "react-simple-captcha";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  const reloadCaptcha = () => {
    loadCaptchaEnginge(6);
  };

  async function submitHandler(e) {
    e.preventDefault();

    if (!validateCaptcha(captchaInput)) {
      toast.error("Invalid Captcha");
      reloadCaptcha();
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/users/login",
        { email, password },
        { withCredentials: true },
      );

      toast.success("Logged in successfully");
      localStorage.setItem("userToken", response.data.message.token);
      navigate("/home");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      {/* Card */}
      <div className="w-[420px] p-8 rounded-2xl bg-gray-900/60 backdrop-blur-lg border border-gray-700 shadow-2xl">
        <h1 className="text-3xl text-center text-white mb-6 font-semibold">
          Login
        </h1>

        <form onSubmit={submitHandler} className="flex flex-col gap-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none"
          />

          {/* CAPTCHA SECTION */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-600 flex flex-col gap-3">
            {/* Canvas */}
            <div className="flex justify-between items-center">
              <LoadCanvasTemplate />
              <button
                type="button"
                onClick={reloadCaptcha}
                className="text-sm px-3 py-1 bg-blue-600 rounded-md text-white hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Enter captcha"
              value={captchaInput}
              required
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="p-2 rounded-md bg-gray-900 text-white border border-gray-600 outline-none focus:border-green-500"
            />
          </div>

          {/* Button */}
          <button className="mt-4 p-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition">
            Login
          </button>

          <p className="text-sm text-gray-400 text-center">
            New to openPost?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-500 cursor-pointer"
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
