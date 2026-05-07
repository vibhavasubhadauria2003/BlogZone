import { createSlice } from "@reduxjs/toolkit";
import { all } from "axios";
const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    userPosts: [],
    allUsers: [],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setUserPosts: (state, action) => {
      state.userPosts = action.payload;
    },
    deleteUserPost: (state, action) => {
      state.userPosts = state.userPosts.filter(
        (post) => post._id !== action.payload,
      );
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
  },
});

export const { setUserData, setUserPosts, deleteUserPost, setAllUsers } =
  userSlice.actions;
export default userSlice.reducer;
