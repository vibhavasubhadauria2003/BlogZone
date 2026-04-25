import React, { useState } from "react";
import Post from "./Post";
import { IoMdCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [currentTab, setCurrentTab] = useState("All Posts");
  const [active, setActive] = useState(false);

  const navigate = useNavigate("");

  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/post/getAllPosts",
          {
            withCredentials: true,
          }
        );
        setPosts(response.data.data.posts);
        setUser(response.data.data.person);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  React.useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/post/getLikedPosts",
          { withCredentials: true }
        );
        console.log("Liked response : " + response);
        setLikedPosts(response.data.message.likedPosts || []);
      } catch (err) {
        console.error("Error fetching liked posts:", err);
      }
    };
    fetchLikedPosts();
  }, []);

  console.log("psots:", posts);
  return (
    <div className="h-screen flex flex-col items-center w-screen bg-gray-950">
      <div className="w-full flex justify-center p-5">
        <div className="w-[85%] flex justify-between items-center">
          <h1 className="text-3xl text-gray-300 cursor-pointer">openPost.</h1>{" "}
          <div className="flex justify-between text-gray-200 w-[30%] uppercase">
            <h1
              className={`cursor-pointer ${
                currentTab === "All Posts" && "text-blue-600"
              }`}
              onClick={() => {
                setCurrentTab("All Posts");
                setActive(false);
              }}
            >
              All Posts
            </h1>
            <h1
              className={`cursor-pointer ${
                currentTab === "Your Posts" && "text-blue-600"
              }`}
              onClick={() => {
                setCurrentTab("Your Posts");
                setActive(true);
              }}
            >
              Your Posts
            </h1>
            <h1
              className="cursor-pointer"
              onClick={() => navigate("/create-post")}
            >
              <span>Create Post</span>
            </h1>

            <div
              onClick={() => navigate("/profile")}
              className="cursor-pointer"
            >
              Profile
            </div>
          </div>
        </div>
      </div>
      {currentTab == "All Posts" && (
        <div className="w-[85%] mt-12 pb-[30px] flex flex-wrap gap-8 justify-center items-center">
          {posts.length === 0 ? (
            <div className="flex flex-col mt-[200px] justify-center items-center gap-5">
              <h1 className="text-3xl text-gray-200 text-center">
                No post created
              </h1>
              <button
                onClick={() => navigate("/create-post")}
                className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-blue-600"
              >
                Create Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <Post
                post={post}
                key={post.post_id}
                setPosts={setPosts}
                active={active}
                likedPosts={likedPosts}
                setLikedPosts={setLikedPosts}
              />
            ))
          )}
        </div>
      )}
      {currentTab == "Your Posts" && (
        <div className="w-[85%] mt-12 pb-[30px] flex flex-wrap gap-8 justify-center items-center">
          {posts.length === 0 ? (
            <div className="flex flex-col mt-[200px] justify-center items-center gap-5">
              <h1 className="text-3xl text-gray-200 text-center">
                No post created
              </h1>
              <button
                onClick={() => navigate("/create-post")}
                className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-blue-600"
              >
                Create Post
              </button>
            </div>
          ) : (
            posts.map((post) => {
              if (
                user.length > 0 &&
                post.person_username === user[0].person_username
              ) {
                return (
                  <Post
                    post={post}
                    key={post.post_id}
                    setPosts={setPosts}
                    active={active}
                    likedPosts={likedPosts}
                    setLikedPosts={setLikedPosts}
                  />
                );
              }
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Home;

// import { useState, useEffect } from "react";
// import Post from "./Post";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function Home() {
//   const [posts, setPosts] = useState([]);
//   const [user, setUser] = useState(null);
//   const [likedPosts, setLikedPosts] = useState([]);

//   const [currentTab, setCurrentTab] = useState("All Posts");
//   const [active, setActive] = useState(false);

//   const navigate = useNavigate();

//   // Fetch all posts + user
//   useEffect(() => {
//     async function fetchPosts() {
//       try {
//         const response = await axios.get(
//           "http://localhost:9000/post/getAllPosts",
//           { withCredentials: true }
//         );

//         setPosts(response.data.data.posts);
//         setUser(response.data.data.person);
//       } catch (err) {
//         console.error("Error fetching posts:", err);
//       }
//     }

//     fetchPosts();
//   }, []);

//   // Fetch liked posts properly
//   useEffect(() => {
//     async function fetchLikedPosts() {
//       try {
//         const response = await axios.get(
//           "http://localhost:9000/post/getLikedPosts",
//           { withCredentials: true }
//         );

//         console.log("Liked response : ", response);
//         setLikedPosts(response.data.message.likedPosts || []);
//       } catch (err) {
//         console.error("Error fetching liked posts:", err);
//       }
//     }

//     fetchLikedPosts();
//   }, []);

//   console.log("Liked Posts: ", likedPosts);

//   if (!user) return <div className="text-white p-10">Loading...</div>;

//   return (
//     <div className="h-screen flex flex-col items-center w-screen bg-gray-950">
//       <div className="w-full flex justify-center p-5">
//         <div className="w-[85%] flex justify-between items-center">
//           <h1 className="text-3xl text-gray-300 cursor-pointer">openPost.</h1>

//           <div className="flex justify-between text-gray-200 w-[30%] uppercase">
//             <h1
//               className={`cursor-pointer ${
//                 currentTab === "All Posts" && "text-blue-600"
//               }`}
//               onClick={() => {
//                 setCurrentTab("All Posts");
//                 setActive(false);
//               }}
//             >
//               All Posts
//             </h1>

//             <h1
//               className={`cursor-pointer ${
//                 currentTab === "Your Posts" && "text-blue-600"
//               }`}
//               onClick={() => {
//                 setCurrentTab("Your Posts");
//                 setActive(true);
//               }}
//             >
//               Your Posts
//             </h1>

//             <h1
//               className="cursor-pointer"
//               onClick={() => navigate("/create-post")}
//             >
//               Create Post
//             </h1>

//             <div
//               onClick={() => navigate("/profile")}
//               className="cursor-pointer"
//             >
//               Profile
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ALL POSTS */}
//       {currentTab === "All Posts" && (
//         <div className="w-[85%] mt-12 pb-[30px] flex flex-wrap gap-8 justify-center items-center">
//           {posts.map((post) => (
//             <Post
//               key={post.post_id}
//               post={post}
//               active={active}
//               setPosts={setPosts}
//               likedPosts={likedPosts}
//               setLikedPosts={setLikedPosts}
//             />
//           ))}
//         </div>
//       )}

//       {/* YOUR POSTS ONLY */}
//       {currentTab === "Your Posts" && (
//         <div className="w-[85%] mt-12 pb-[30px] flex flex-wrap gap-8 justify-center items-center">
//           {posts
//             .filter((p) => p.person_username === user[0].person_username)
//             .map((post) => (
//               <Post
//                 key={post.post_id}
//                 post={post}
//                 active={active}
//                 setPosts={setPosts}
//                 likedPosts={likedPosts}
//                 setLikedPosts={setLikedPosts}
//               />
//             ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default Home;
