import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdVerified } from "react-icons/md";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
} from "react-simple-captcha";
function Signup() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isOtpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
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
    let isAdult = false;
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      isAdult = age >= 18;
    }
    if (!isAdult) {
      toast.error("You must be at least 18 years old to register.");
      return;
    }

    const isStrongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password,
      );
    if (!isStrongPassword) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      );
      return;
    }
    const data = {
      userName: username,
      fullName: `${firstName} ${lastName}`,
      email: email,
      dob: dob,
      gender: gender,
      password: password,
    };
    console.log(data);

    try {
      const response = await axios.post("http://localhost:8080/users", data, {
        withCredentials: true,
      });
      toast.success("Registered successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      console.log(response);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  }

  const verifyEmail = async () => {
    try {
      if (email) {
        const response = await axios.post(
          "http://localhost:8080/users/send-verification-code",
          {
            email,
          },
          {
            withCredentials: true,
          },
        );
        console.log("Email Verification : ", response);
        setOtpSent(true);
        toast.success("OTP sent successfully");
      } else {
        toast.error("Email is required");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to send OTP. Email is already registered.");
    }
  };

  const verifyOTP = async () => {
    try {
      if (otp) {
        const response = await axios.post(
          "http://localhost:8080/users/verify",
          {
            email: email,
            verificationcode: otp,
          },
          {
            withCredentials: true,
          },
        );
        console.log("Email Verification : ", response);
        setOtpSent(false);
        setIsVerified(true);
      } else {
        toast.error("OTP is required");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-black via-gray-900 to-gray-950">
      {/* LEFT SIDE */}
      <div className="w-1/2 hidden md:flex flex-col justify-center items-center text-white p-10">
        <h1 className="text-6xl font-bold text-blue-500 mb-4 font-serif">
          OpenPost.
        </h1>
        <p className="text-gray-400 text-center max-w-md">
          Create your account and start sharing your ideas with the world.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex justify-center items-center overflow-y-auto">
        <div className="w-[450px] p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <h2 className="text-3xl text-white text-center mb-6">
            Create Account 🚀
          </h2>

          <form onSubmit={submitHandler} className="flex flex-col gap-4">
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
            />

            {/* Name Row */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-1/2 p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-1/2 p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
              />
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            />

            {/* 🔐 OTP SECTION */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
              {!isVerified && !isOtpSent && (
                <button
                  type="button"
                  onClick={verifyEmail}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition"
                >
                  Send Verification Code
                </button>
              )}

              {isOtpSent && !isVerified && (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="p-2 rounded-md bg-black text-white border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={verifyOTP}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
                  >
                    Verify OTP
                  </button>
                </>
              )}

              {isVerified && (
                <div className="flex items-center justify-center gap-2 text-green-500 font-medium">
                  Verified <MdVerified />
                </div>
              )}
            </div>

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            />

            {/* Gender */}
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* DOB */}
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            />

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

            {/* Submit */}
            <button
              type="submit"
              className="mt-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
            >
              Create Account
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
