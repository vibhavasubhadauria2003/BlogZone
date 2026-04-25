import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
function CreatePost() {
  const [postContent, setPostContent] = useState("");
  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault();
    const data = {
      post_content: postContent,
    };

    console.log(data);
    const response = await axios.post(
      "http://localhost:9000/post/create-post",
      data,
      { withCredentials: true }
    );
    console.log(response);
    toast.success("Post created successfully");
    navigate("/home");
  };
  return (
    <div className="h-screen w-screen flex justify-center bg-gray-950">
      <div className="w-[80%] flex flex-col mt-10 items-center">
        <h1 className="text-4xl text-gray-200 uppercase font-bold">
          Create Post
        </h1>
        <form
          action=""
          className="flex flex-col w-[80%] gap-5 mt-8 items-center"
          onSubmit={submitHandler}
        >
          <textarea
            name=""
            id=""
            required
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write here your message..."
            className="border border-gray-200 w-full h-[300px] rounded-md p-[10px_20px] text-gray-200 text-xl"
          ></textarea>

          <div className="flex gap-5">
            <button
              onClick={() => navigate("/home")}
              className="mt-5 text-xl p-[10px_20px] w-[200px] cursor-pointer text-gray-200 rounded-lg border border-gray-200"
            >
              Home
            </button>
            <button className="mt-5 text-xl p-[10px_20px] w-[200px] cursor-pointer text-gray-200 rounded-lg bg-blue-600">
              Upload Post
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="mt-5 text-xl p-[10px_20px] w-[200px] cursor-pointer text-gray-200 rounded-lg border border-gray-200"
            >
              Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
