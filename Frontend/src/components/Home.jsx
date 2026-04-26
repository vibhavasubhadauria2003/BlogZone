import React, { use, useState } from "react";
import Post from "./Post";
import { IoMdCreate } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/slices/user.slice";
import Posts from "./Posts";

function Home() {
  const navigate = useNavigate("");
  const posts = useSelector((state) => state.post.posts);

  const [user, setUser] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:9000/users", {
          withCredentials: true,
        });

        console.log("Current User Response: ", response.data.data);
        dispatch(setUserData(response.data.data));
      } catch (err) {
        console.error("Error fetching liked posts:", err);
      }
    };
    getCurrentUser();
  }, []);

  return (
    <div className="h-screen flex flex-col items-center w-screen bg-gray-950">
      <Navbar />
      <div className="relative w-[85%] h-full mt-5 flex justify-center items-center">
        <button
          onClick={() => navigate("/create-post")}
          className="absolute bottom-25 z-50 right-0 flex items-center gap-2 text-gray-800 bg-gray-200 text-xl p-[20px_40px] rounded-3xl cursor-pointer hover:scale-105 transition-all ease-in-out duration-200"
        >
          <IoMdCreate />
          Create Post
        </button>
        {posts.length > 0 ? (
          <div className="w-full flex flex-col gap-5 mt-5">
            {posts.map((post) => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-3xl opacity-70">
            No posts available.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
