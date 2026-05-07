import React from "react";
import Navbar from "./Navbar";
import { IoMdCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { setAllUsers, setUserPosts } from "../redux/slices/user.slice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Post from "./Post";
import MyPost from "./MyPost";
import { HiDotsVertical } from "react-icons/hi";
import User from "./User";

function AdminPage() {
  const navigate = useNavigate("");
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);

  React.useEffect(() => {
    if (userData?.length === 0 || !userData) navigate("/home");
    const getMyPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/users/all-users",
          {
            withCredentials: true,
          },
        );

        console.log("all users data: ", response.data.data);
        dispatch(setAllUsers(response.data.data));
      } catch (err) {
        console.error("Error fetching liked posts:", err);
      }
    };
    getMyPosts();
  }, []);
  const posts = useSelector((state) => state.user.userPosts);
  const allUsers = useSelector((state) => state.user.allUsers);
  return (
    <div className="h-screen flex flex-col items-center w-screen bg-gray-950">
      <Navbar />
      <div className="relative w-[85%] h-full mt-20 flex items-center justify-center p-[30px]">
        {allUsers.length > 0 ? (
          <div className="w-full h-full flex flex-col items-center gap-5 mt-5 ">
            {allUsers.map((user) => (
              <User key={user._id} user={user} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <p className="text-gray-500 text-3xl opacity-70">
              No Users available.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Create User
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
