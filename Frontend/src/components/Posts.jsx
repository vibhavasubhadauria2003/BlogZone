import React from "react";
import Navbar from "./Navbar";
import { IoMdCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function Posts() {
  const navigate = useNavigate("");
  return (
    <div className="h-screen flex flex-col items-center w-screen bg-gray-950">
      <Navbar />
      <div className="relative w-[85%] h-full mt-5 flex justify-end">
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
