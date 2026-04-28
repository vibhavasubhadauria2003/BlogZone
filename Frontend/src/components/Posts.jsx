import React from "react";
import Navbar from "./Navbar";
import { IoMdCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { setUserPosts } from "../redux/slices/user.slice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Post from "./Post";
import MyPost from "./MyPost";

function Posts() {
  const navigate = useNavigate("");
  const dispatch = useDispatch();
  React.useEffect(() => {
    const getMyPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/users/my-posts",
          {
            withCredentials: true,
          },
        );

        console.log("post data: ", response.data.data);
        dispatch(setUserPosts(response.data.data));
      } catch (err) {
        console.error("Error fetching liked posts:", err);
      }
    };
    getMyPosts();
  }, []);
  const posts = useSelector((state) => state.user.userPosts);
  const userData = useSelector((state) => state.user.userData);
  return (
    <div className="h-screen flex flex-col items-center w-screen bg-gray-950">
      <Navbar />
      <div className="relative  w-[85%] h-full mt-20 flex justify-end">
        {posts.length > 0 ? (
          <div className="w-full h-full flex flex-col items-center gap-5 mt-5 ">
            {posts.map((post) => (
              <MyPost key={post._id} post={post} userData={userData} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-3xl opacity-70">
            No posts available.
          </p>
        )}
        <button
          onClick={() => navigate("/create-post")}
          className="fixed bottom-25 z-50 right-20 flex items-center gap-2 text-gray-800 bg-gray-200 text-xl p-[20px_40px] rounded-3xl cursor-pointer hover:scale-105 transition-all ease-in-out duration-200"
        >
          <IoMdCreate />
          Create Post
        </button>
      </div>
    </div>
  );
}

export default Posts;
