import React, { use, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = React.useState([]);

  async function handleLogout() {
    const response = await axios.get(
      "http://localhost:9000/person/logout-person",
      {
        withCredentials: true,
      }
    );
    toast.success("Logged out successfully");
    console.log("Logout Response: ", response.data);
    localStorage.removeItem("userToken");
    navigate("/login");
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/person/getProfile",
          {
            withCredentials: true,
          }
        );
        console.log("Profile Data: ", response.data.message);
        setUserData(response.data.message);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);
  console.log("User Data: ", userData);
  return (
    <div className="h-screen flex flex-col items-center w-screen  gap-3">
      <div className="w-[60%] mt-[50px] flex justify-around p-[30px] border border-gray-200 rounded-2xl items-center">
        <div className="flex flex-col items-center mt-10 mb-10">
          <h1 className="text-4xl text-gray-200 font-bold mb-5">
            {userData[0]?.person_fname} {userData[0]?.person_lname}
          </h1>
          <p className="text-2xl text-blue-600">
            @{userData[0]?.person_username}
          </p>
          <p className="text-gray-200">Email : {userData[0]?.person_email}</p>
        </div>
        <div className="">
          <img
            src="https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
            alt=""
            className="w-[200px] h-[200px] rounded-full object-cover"
          />
        </div>
      </div>
      <div className="flex gap-5">
        <button
          onClick={() => navigate("/home")}
          className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-blue-600"
        >
          Home
        </button>
        <button
          onClick={handleLogout}
          className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-red-600"
        >
          Logout
        </button>
        <button
          onClick={() => navigate("/create-post")}
          className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-blue-600"
        >
          Create Post
        </button>
      </div>
    </div>
  );
}

export default Profile;
