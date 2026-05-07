import axios from "axios";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { toast } from "react-hot-toast";
import React from "react";
import { FiMessageCircle } from "react-icons/fi";
import { removePost, setPosts } from "../redux/slices/post.slice";
import { useDispatch, useSelector } from "react-redux";
import { deleteUserPost, setUserPosts } from "../redux/slices/user.slice";

export default function MyPost({ post, userData }) {
  const dispatch = useDispatch();
  const currentUser = userData?.[0];
  const author = post?.authorDetails?.[0];
  const posts = useSelector((state) => state.post.posts);

  const [likeCount, setLikeCount] = React.useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = React.useState(false);

  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [comments, setComments] = React.useState(post.commentDetails || []);

  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef();

  // 🔄 Sync post changes
  React.useEffect(() => {
    if (!post) return;

    setLikeCount(post.likesCount || 0);
    setComments(post.commentDetails || []);

    if (!currentUser?._id) return;

    const liked =
      post?.likedByUsers?.some(
        (user) => String(user._id) === String(currentUser._id),
      ) || false;

    setIsLiked(liked);
  }, [post, currentUser]);

  // 🔒 Close menu on outside click
  React.useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ❤️ Like Handler
  async function likeHandler() {
    const newLikeState = !isLiked;

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
        commenterDetails: [
          {
            fullName: currentUser?.fullName,
            userName: currentUser?.userName,
            profileImage: currentUser?.profileImage,
          },
        ],
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      const updatedPosts = posts.map((p) =>
        p._id === post._id
          ? {
              ...p,
              commentDetails: [
                newComment,
                ...(Array.isArray(p.commentDetails) ? p.commentDetails : []),
              ],
            }
          : p,
      );

      dispatch(setPosts(updatedPosts));

      toast.success("Comment added 💬");
    } catch {
      toast.error("Failed to comment");
    }
  }

  // 🗑️ Delete Post
  async function deletePost() {
    try {
      await axios.delete(
        `http://localhost:8080/users/delete-post/${post._id}`,
        { withCredentials: true },
      );

      console.log("Post deleted: ", post._id);
      const updatedPosts = userData[0].posts.filter((p) => p._id !== post._id);

      console.log("Updated Posts after deletion: ", updatedPosts);
      dispatch(deleteUserPost(post._id));

      toast.success("Post deleted 🗑️");
    } catch (e) {
      toast.error("Failed to delete post");
    }
  }

  return (
    <div className="bg-gray-900/80 w-[85%] backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-5 flex flex-col gap-4 hover:scale-[1.01] transition-all duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <img
            src={userData[0]?.profileImage}
            alt={userData[0]?.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-white">
              {userData[0]?.fullName}
            </h1>
            <p className="text-sm text-blue-400">@{userData[0]?.userName}</p>
          </div>
        </div>

        {/* ⋮ MENU */}

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

        {/* COMMENT */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <FiMessageCircle className="text-2xl text-gray-300 hover:scale-125 transition" />
          <span className="text-gray-200">{comments.length}</span>
        </div>
      </div>

      {/* COMMENTS */}
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
          <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto hide-scrollbar">
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
                        src={c.commenterDetails?.[0]?.profileImage}
                        alt="user"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm text-white font-semibold">
                          {c.commenterDetails?.[0]?.fullName}
                        </p>
                        <p className="text-xs text-blue-400">
                          @{c.commenterDetails?.[0]?.userName}
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
