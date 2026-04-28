import axios from "axios";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-hot-toast";
import React from "react";
import { FiMessageCircle } from "react-icons/fi";

function MyPost({ post, userData }) {
  const [likeCount, setLikeCount] = React.useState(post.like_count || 0);
  const [isLiked, setIsLiked] = React.useState(
    post?.likedByUsers?.includes(userData?.[0]?.id),
  );

  async function likeHandler() {
    try {
      if (isLiked) {
        const res = await axios.post(
          `http://localhost:9000/users/like`,
          {
            postId: post._id,
          },
          { withCredentials: true },
        );
        console.log("like response", res);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);

        toast.success("Unliked");
      } else {
        const res = await axios.post(
          `http://localhost:9000/users/like`,
          {
            postId: post._id,
          },
          { withCredentials: true },
        );
        console.log("like response", res);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

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
            src={userData[0].profileImage}
            alt={userData[0].fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-white">
              {userData[0].fullName}
            </h1>
            <p className="text-sm text-blue-400">@{userData[0].userName}</p>
          </div>
        </div>
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
        <div className="flex items-center gap-2">
          {isLiked ? (
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

          <span className="text-gray-200 text-xl font-medium">{likeCount}</span>
        </div>
        {/* <div className="flex items-center gap-2">
          <FiMessageCircle
            className="text-3xl text-gray-200 cursor-pointer hover:scale-125 transition"
            onClick={likeHandler}
          />

          <span className="text-gray-200 text-xl font-medium">{likeCount}</span>
        </div> */}
      </div>
    </div>
  );
}

export default MyPost;
