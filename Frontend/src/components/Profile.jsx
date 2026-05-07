import React, { use, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/slices/user.slice";
import Posts from "./Posts";
function Profile() {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();

  async function handleLogout() {
    const response = await axios.get("http://localhost:8080/users/logout", {
      withCredentials: true,
    });
    toast.success("Logged out successfully");
    console.log("Logout Response: ", response.data);
    localStorage.removeItem("userToken");
    navigate("/login");
  }

  React.useEffect(() => {
    console.log("User Data in Profile Component: ", userData);
    //if (!userData) navigate("/login");
    const getCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/users", {
          withCredentials: true,
        });

        console.log("Current User Response: ", response.data.data);
        dispatch(setUserData(response.data.data));
      } catch (err) {
        console.error("Error fetching liked posts:", err);
        navigate("/home");
      }
    };
    getCurrentUser();
  }, []);
  console.log("User Data: ", userData);
  return (
    <div className="h-screen flex flex-col items-center w-screen  gap-3">
      <Navbar />
      <div className="relative w-[60%] mt-[150px] flex gap-10 p-[30px] border border-gray-800 rounded-2xl items-center hover:shadow-2xl hover:shadow-gray-900 transition-all ease-in-out duration-700">
        <div className="relative">
          <img
            src={
              userData?.[0]?.profileImage ||
              "https://static.vecteezy.com/system/resources/thumbnails/033/129/417/small/a-business-man-stands-against-white-background-with-his-arms-crossed-ai-generative-photo.jpg"
            }
            alt=""
            className="w-[200px] h-[200px] rounded-full object-cover"
          />
          <button
            onClick={() => navigate("/profile/edit")}
            className="absolute right-4 bottom-3 bg-blue-600 text-gray-200 h-7 w-7 flex items-center justify-center rounded-full cursor-pointer text-xl"
          >
            +
          </button>
        </div>

        <div className="flex flex-col items-start mt-10 mb-10">
          <h1 className="text-4xl text-gray-200 font-bold mb-5">
            {userData?.[0]?.fullName || "Yaman Gahlout"}
          </h1>
          <p className="text-2xl text-blue-600">
            @{userData?.[0]?.userName || "yaman_gahlout"}
          </p>
          <p className="text-gray-200">
            {userData?.[0]?.email || "yaman.gahlout@example.com"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="absolute right-0 top-0 m-[30px] cursor-pointer text-red-600 text-xl font-bold"
        >
          Logout
        </button>
      </div>

      <button className="mt-10 flex items-center gap-2 text-gray-200 bg-blue-600 text-xl p-[10px_20px] rounded-xl cursor-pointer hover:scale-105 transition-all ease-in-out duration-200">
        Your Posts
      </button>
      <Posts />
    </div>
  );
}

export default Profile;
