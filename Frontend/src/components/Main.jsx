import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate("");
  return (
    <div className="h-screen w-screen bg-gray-950">
      <div className="w-full flex-col flex justify-center items-center p-5">
        <div className="w-[85%] flex justify-between items-center">
          <h1 className="text-3xl text-gray-300 cursor-pointer">openPost.</h1>{" "}
          <div className="flex justify-between text-gray-200 gap-7 uppercase">
            <button
              onClick={() => navigate("/signup")}
              className="p-[10px_20px] border cursor-pointer border-gray-200 text-gray-200 rounded-lg hover:text-black hover:bg-gray-200 transition-all ease-in-out duration-700"
            >
              Signup
            </button>
            <button
              onClick={() => navigate("/login")}
              className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>
        <div className="w-[65%] flex flex-col gap-6 mt-[200px] justify-between items-center">
          <h2 className="text-6xl font-semibold text-gray-100">
            Share Your Thoughts With the World
          </h2>
          <h1 className="text-lg w-[80%] text-gray-100 opacity-80 text-center">
            openPost lets you create posts, interact with people, and express
            yourself freely. Join the community and start sharing today.
          </h1>
          <button
            onClick={() => navigate("/signup")}
            className="p-[10px_20px] cursor-pointer text-gray-200 rounded-lg bg-blue-600"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Main;
