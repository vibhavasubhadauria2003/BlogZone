import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";

function CreatePost() {
  const [postContent, setPostContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!postContent && !image) {
      toast.error("Add something to post");
      return;
    }

    const formData = new FormData();
    formData.append("content", postContent);
    if (image) formData.append("postImage", image);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:9000/users/upload-post",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Post created successfully 🚀");
      navigate("/home");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center">
      <Navbar />
      <div className="w-[90%] mt-[100px] max-w-2xl bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-6">
        {/* Title */}
        <h1 className="text-3xl text-white font-bold text-center mb-6">
          ✨ Create a Post
        </h1>

        <form onSubmit={submitHandler} className="flex flex-col gap-5">
          {/* Textarea */}
          <textarea
            required
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-[180px] rounded-xl p-4 bg-gray-800 text-white text-lg outline-none border border-gray-700 focus:border-blue-500 transition"
          />

          {/* Image Upload */}
          <label className="cursor-pointer border border-dashed border-gray-600 rounded-xl p-4 text-center text-gray-400 hover:border-blue-500 transition">
            📷 Click to upload image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-60 object-cover rounded-xl border border-gray-700"
            />
          )}

          {/* Buttons */}
          <div className="flex justify-between gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Posting..." : "🚀 Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
