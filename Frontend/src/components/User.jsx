import React from "react";
import { HiDotsVertical } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { setAllUsers } from "../redux/slices/user.slice";

function User({ user }) {
  const navigate = useNavigate("");
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef();
  const allUsers = useSelector((state) => state.user.allUsers);
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

  async function deleteUser() {
    try {
      await axios.delete(`http://localhost:8080/users/delete/${user._id}`, {
        withCredentials: true,
      });

      console.log("User deleted: ", user._id);
      const updatedUsers = allUsers.filter((u) => u._id !== user._id);
      dispatch(setAllUsers(updatedUsers));

      toast.success("User deleted 🗑️");
    } catch (e) {
      toast.error("Failed to delete user");
    }
  }
  return (
    <div className="bg-gray-900/80 w-[85%] backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-5 flex flex-col gap-4 hover:scale-[1.01] transition-all duration-300">
      {/* HEADER */}
      <div className="flex justify-between  relative">
        <div className="flex gap-4 items-center">
          <img
            src={user.profileImage}
            alt={user.fullName}
            className="w-50 h-50 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {user.fullName}
            </h1>
            <p className="text-2xl text-blue-400">{user.userName}</p>
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
                onClick={deleteUser}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;
