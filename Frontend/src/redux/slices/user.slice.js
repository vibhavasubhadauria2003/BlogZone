import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    userPosts: [],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setUserPosts: (state, action) => {
      state.userPosts = action.payload;
    },
  },
});

export const { setUserData, setUserPosts } = userSlice.actions;
export default userSlice.reducer;
