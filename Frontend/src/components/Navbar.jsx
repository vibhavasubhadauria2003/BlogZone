import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const userData = useSelector((state) => state.user.userData);
  console.log("userData in navbar: ", userData);
  const navigate = useNavigate();
  return (
    <div className="w-full bg-[#030712] fixed z-50 top-0 flex justify-center p-5 border-b border-gray-600">
      <div className="w-[85%] flex justify-between items-center">
        <h1 className="text-3xl font-medium cursor-pointer text-blue-500 font-serif">
          OpenPost.
        </h1>{" "}
        <div className="flex justify-between items-center text-gray-200 w-[20%] uppercase">
          <h1
            onClick={() => navigate("/home")}
            className={
              isActive("/home")
                ? "text-blue-600 cursor-pointer font-medium"
                : "cursor-pointer"
            }
          >
            Home
          </h1>
          <h1
            onClick={() => navigate("/your-posts")}
            className={
              isActive("/your-posts")
                ? "text-blue-600 cursor-pointer font-medium"
                : "cursor-pointer"
            }
          >
            Your Posts
          </h1>

          <div
            onClick={() => navigate("/profile")}
            className={`h-8 w-8 overflow-hidden bg-white rounded-full ${isActive("/profile") ? " border-2 border-blue-500" : ""} cursor-pointer`}
          >
            <img
              src={
                userData?.[0]?.profileImage ||
                "https://static.vecteezy.com/system/resources/thumbnails/033/129/417/small/a-business-man-stands-against-white-background-with-his-arms-crossed-ai-generative-photo.jpg"
              }
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
