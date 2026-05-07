import axios from "axios";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import React from "react";
import { FiMessageCircle } from "react-icons/fi";
import { removePost, setPosts } from "../redux/slices/post.slice";
import { useDispatch, useSelector } from "react-redux";
import Posts from "./Posts";
import { HiDotsVertical } from "react-icons/hi";

function Post({ post }) {
  const author = post?.authorDetails?.[0];
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.post.posts);
  const userData = useSelector((state) => state.user.userData);

  const [likeCount, setLikeCount] = React.useState(post.likesCount || 0);

  const [isLiked, setIsLiked] = React.useState(
    post?.likedUsers?.includes(userData?.[0]?._id) || false,
  );

  console.log(
    "Post Component - isLiked: ",
    post?.likedUsers?.includes(userData?.[0]?._id),
  );
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [comments, setComments] = React.useState(post.commentDetails || []);

  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef();

  // ❤️ Like Handler
  async function likeHandler() {
    const newLikeState = !isLiked;

    // optimistic update
    setIsLiked(newLikeState);
    setLikeCount((prev) => (newLikeState ? prev + 1 : prev - 1));

    try {
      await axios.post(
        "http://localhost:8080/users/like",
        { postId: post._id },
        { withCredentials: true },
      );

      toast.success(newLikeState ? "Liked ❤️" : "Unliked");
    } catch {
      // rollback
      setIsLiked(!newLikeState);
      setLikeCount((prev) => (newLikeState ? prev - 1 : prev + 1));
      toast.error("Action failed");
    }
  }

  // 💬 Add Comment
  async function addComment() {
    if (!commentText.trim()) return;

    try {
      await axios.post(
        "http://localhost:8080/users/comment",
        {
          postId: post._id,
          comment_text: commentText,
        },
        { withCredentials: true },
      );

      const newComment = {
        comment_text: commentText,
        commenterFullName: userData[0]?.fullName,
        commenterUserName: userData[0]?.userName,
        commenterProfileImage: userData[0]?.profileImage,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      const updatedPost = posts.map((p) =>
        p._id === post._id
          ? {
              ...p,
              commentDetails: [newComment, ...(p.commentDetails || [])],
            }
          : p,
      );
      dispatch(setPosts(updatedPost));
      toast.success("Comment added 💬");
    } catch {
      toast.error("Failed to comment");
    }
  }

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function deletePost() {
    try {
      await axios.delete(
        `http://localhost:8080/users/delete-post/${post._id}`,
        { withCredentials: true },
      );

      console.log("Post deleted: ", post._id);
      const updatedPosts = posts.filter((p) => p._id !== post._id);

      console.log("Updated Posts after deletion: ", updatedPosts);
      dispatch(removePost(post._id));

      toast.success("Post deleted 🗑️");
    } catch (e) {
      toast.error("Failed to delete post");
    }
  }

  const canDelete =
    String(author?._id) === String(userData?.[0]?._id) ||
    userData?.[0]?.role === "admin";

  return (
    <div className="bg-gray-900/80 w-[85%] backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-5 flex flex-col gap-4 hover:scale-[1.01] transition-all duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <img
            src={author?.profileImage}
            alt={author?.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-white">
              {author?.fullName}
            </h1>
            <p className="text-sm text-blue-400">@{author?.userName}</p>
          </div>
        </div>

        {/* ⋮ MENU */}

        {canDelete && (
          <div className="relative" ref={menuRef}>
            <HiDotsVertical
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-xl text-gray-300 cursor-pointer hover:text-white"
            />

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={deletePost}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      {post.content && <p className="text-gray-300">{post.content}</p>}

      {/* IMAGE */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full max-h-[400px] object-cover rounded-xl border border-gray-700"
        />
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-6 mt-2">
        {/* LIKE */}
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
          <span className="text-gray-200">{likeCount}</span>
        </div>

        {/* COMMENT TOGGLE */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <FiMessageCircle className="text-2xl text-gray-300 hover:scale-125 transition" />
          <span className="text-gray-200">{comments.length}</span>
        </div>
      </div>

      {/* 💬 COMMENTS SECTION */}
      {showComments && (
        <div className="mt-4 bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">
          {/* INPUT */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-2 rounded-md bg-black text-white border border-gray-600 outline-none"
            />
            <button
              onClick={addComment}
              className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Post
            </button>
          </div>

          {/* LIST */}
          <div className="flex hide-scrollbar flex-col gap-3 max-h-[200px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center">
                No comments yet
              </p>
            ) : (
              comments.map((c, index) => (
                <div key={index} className="flex gap-3">
                  <div className="bg-gray-900 p-2 rounded-lg w-full">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.commenterProfileImage}
                        alt="user"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm text-white font-semibold">
                          {c.commenterFullName}
                        </p>
                        <p className="text-xs text-blue-400">
                          @{c.commenterUserName}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-1 pl-10">
                      {c.comment_text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
