import axios from "axios";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-hot-toast";
import React from "react";

function Post({ post, setPosts, active, likedPosts, setLikedPosts }) {
  const [likeCount, setLikeCount] = React.useState(post.like_count || 0);

  async function deleteHandler() {
    setPosts((prev) => prev.filter((p) => p.post_id !== post.post_id));

    try {
      await axios.delete(
        `http://localhost:9000/post/deletePost/${post.post_id}`,
        { withCredentials: true },
      );
      toast.success("Post Deleted 🗑️");
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  async function likeHandler() {
    if (!Array.isArray(likedPosts)) return;

    try {
      if (likedPosts.includes(post.post_id)) {
        setLikedPosts((prev) => prev.filter((id) => id !== post.post_id));
        setLikeCount((prev) => prev - 1);

        await axios.post(
          `http://localhost:9000/post/likePost/${post.post_id}`,
          {},
          { withCredentials: true },
        );

        toast.success("Unliked");
      } else {
        setLikedPosts((prev) => [...prev, post.post_id]);
        setLikeCount((prev) => prev + 1);

        await axios.post(
          `http://localhost:9000/post/likePost/${post.post_id}`,
          {},
          { withCredentials: true },
        );

        toast.success("Liked ❤️");
      }
    } catch (err) {
      toast.error("Action failed");
    }
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-gray-900/80 w-[85%] backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-5 flex flex-col gap-4  hover:scale-[1.01] transition-all duration-300 h-[500px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-center gap-3">
          <img
            src={post.author.profileImage}
            alt={post.author.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-white">
              {post.author.fullName}
            </h1>
            <p className="text-sm text-blue-400">@{post.author.userName}</p>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            • {formatDate(post.createdAt)}
          </p>
        </div>

        {active && (
          <MdDelete
            className="text-2xl text-red-500 cursor-pointer hover:scale-110 transition"
            onClick={deleteHandler}
          />
        )}
      </div>

      {/* Content */}
      {post.post_content && (
        <p className="text-gray-300 text-base leading-relaxed">
          {post.post_content}
        </p>
      )}

      {/* Image (if exists) */}
      <div className="flex gap-5 ">
        {post.image && (
          <img
            src={post.image}
            alt="post"
            className="w-[300px] h-[300px] object-cover rounded-xl border border-gray-700"
          />
        )}
        <p className="text-gray-300 w-[70%] opacity-85 text-base leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-2">
        {Array.isArray(likedPosts) && likedPosts.includes(post.post_id) ? (
          <FcLike
            className="text-3xl cursor-pointer hover:scale-125 transition"
            onClick={likeHandler}
          />
        ) : (
          <FaRegHeart
            className="text-3xl text-gray-300 cursor-pointer hover:text-red-500 hover:scale-125 transition"
            onClick={likeHandler}
          />
        )}

        <span className="text-gray-200 text-lg font-medium">{likeCount}</span>
      </div>
    </div>
  );
}

export default Post;
