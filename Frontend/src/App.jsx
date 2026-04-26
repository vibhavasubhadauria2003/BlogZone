import { Route, Routes } from "react-router-dom";
import Main from "./components/Main";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import Profile from "./components/Profile";
import Authenticate from "./components/Authenticate";
import Posts from "./components/Posts";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route
          path="/home"
          element={
            <Authenticate>
              <Home />
            </Authenticate>
          }
        ></Route>
        <Route
          path="/your-posts"
          element={
            <Authenticate>
              <Posts />
            </Authenticate>
          }
        ></Route>
        <Route
          path="/create-post"
          element={
            <Authenticate>
              <CreatePost />
            </Authenticate>
          }
        ></Route>
        <Route
          path="/profile"
          element={
            <Authenticate>
              <Profile />
            </Authenticate>
          }
        ></Route>

        <Route
          path="/profile/edit"
          element={
            <Authenticate>
              <EditProfile />
            </Authenticate>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
