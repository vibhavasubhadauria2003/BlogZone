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
  // const posts = useSelector((state) => state.post.posts);

  const posts = [
    {
      _id: "64b8c9e5e1d2c8a1f0a7b9c",
      content:
        "These tools should be beneficial to all Redux users. Whether you're a brand new Redux user setting up your first project, or an experienced user who wants to simplify an existing application, Redux Toolkit can help you make your Redux code better.",
      image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
      likes: 10,
      author: {
        _id: "64b8c9e5e1d2c8a1f0a7b9b",
        userName: "john_doe",
        fullName: "John Doe",
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      createdAt: "2024-07-01T12:00:00Z",
    },
    {
      _id: "64b8c9e5e1d2c8a1f0a7b9d",
      content: "Loving this new platform!",
      image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
      likes: 25,
      author: {
        _id: "64b8c9e5e1d2c8a1f0a7b9c",
        userName: "jane_smith",
        fullName: "Jane Smith",
        profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      createdAt: "2024-07-02T15:30:00Z",
    },
  ];

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
      <div className="relative w-[85%] h-full mt-5 flex justify-center items-center p-[30px]">
        <button
          onClick={() => navigate("/create-post")}
          className="fixed bottom-25 z-50 right-20 flex items-center gap-2 text-gray-800 bg-gray-200 text-xl p-[20px_40px] rounded-3xl cursor-pointer hover:scale-105 transition-all ease-in-out duration-200"
        >
          <IoMdCreate />
          Create Post
        </button>
        {posts.length > 0 ? (
          <div className="w-full h-full flex flex-col items-center gap-5 mt-5 ">
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
