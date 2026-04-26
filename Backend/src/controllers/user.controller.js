import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Code } from "../models/code.model.js";
import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";
import { sendEmail } from "../utils/SendMail.js";
import e from "express";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const userAccessToken = await user.generateAccessToken();
    return { userAccessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const existingEmail = await Code.findOne({ email });
  if (existingEmail) {
    console.log("Verification code already sent to this email: ", email);
    try {
      await Code.findByIdAndDelete(existingEmail._id);
    } catch (error) {
      console.error("Error while deleting existing verification code: ", error);
      throw new ApiError(500, "Error while deleting verification code");
    }
  }
  const verificationcode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    const code = await Code.create({
      email,
      verificationcode,
      isVerified: false,
    });
    if (!code) {
      throw new ApiError(500, "Error while inputing verification code on DB");
    }
    const sendEmailResult = sendEmail(
      email,
      "Email Verification for BlogZone",
      `Your verification code is: ${verificationcode}`,
      `<p>Your verification code is: <strong>${verificationcode}</strong></p>`
    );
    if (!sendEmailResult) {
      await User.findByIdAndDelete(createdUser._id);
      throw new ApiError(500, "Error while sending verification email");
    }
    console.log("Verification email sent successfully to ", email);
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Verification code sent to email successfully"
        )
      );
  } catch (error) {
    console.error("Error during user registration: ", error);
    throw new ApiError(500, "Error while inputing verification code on DB");
  }
});

const verifyUser = asyncHandler(async (req, res) => {
  const { email, verificationcode } = req.body;
  console.log(
    "Verifying user with email: ",
    email,
    " and code: ",
    verificationcode
  );
  if (!email || !verificationcode) {
    throw new ApiError(400, "Email and verification code are required");
  }
  const code = await Code.findOne({ email });
  if (!code) {
    throw new ApiError(404, "Verification code not found for this email");
  }
  if (code.verificationcode !== verificationcode) {
    throw new ApiError(400, "Invalid verification code");
  }

  try {
    const updatedCode = await Code.findByIdAndUpdate(
      code._id,
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );
  } catch (error) {
    console.error("Error while updating verification code status: ", error);
    throw new ApiError(500, "Error while verifying code on DB");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification code is valid"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, userName, fullName, dob, gender, password } = req.body;
  if (!fullName || !userName || !email || !password || !dob || !gender) {
    throw new ApiError(400, "All fields are required");
  }
  // Check if user already exists
  console.log(email, userName, fullName, dob, gender, password);
  let existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  existingUser = await User.findOne({ userName });
  if (existingUser) {
    throw new ApiError(409, "User with this username already exists");
  }
  console.log("User does not exist, proceeding with registration");
  const code = await Code.findOne({ email });
  if (!code) {
    throw new ApiError(404, "Verification code not found for this email");
  }
  if (!code.isVerified) {
    throw new ApiError(
      400,
      "Email not verified. Please verify your email before registering"
    );
  }
  try {
    const user = await User.create({
      email: email,
      userName,
      fullName,
      dob,
      gender,
      password,
      profileImage:
        "https://res.cloudinary.com/dcak9wrg6/image/upload/v1745732022/ltc5yucvghro4j2zo6ek.jpg",
    });
    if (!user) {
      throw new ApiError(500, "Error while registering on DB");
    }
    await Code.findByIdAndDelete(code._id);
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    console.log("User created in DB: ", createdUser);
    if (!createdUser) {
      throw new ApiError(500, "Error while registering on DB");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };
    return res
      .status(201)
      .cookie("emailToken", email, options)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    if (profileImage?.public_id) {
      await deleteOnCloudinary(profileImage.public_id);
    }
    console.error("Error during user registration: ", error);
    throw new ApiError(500, "Error while registering on DB");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }
  const { userAccessToken } = await generateAccessandRefreshToken(user._id);
  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  };
  return res
    .status(200)
    .cookie("userAccessToken", userAccessToken, options)
    .json(new ApiResponse(200, updatedUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0),
  };
  return res
    .status(200)
    .clearCookie("userAccessToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  console.log("user email : ", req.email);
  try {
    const user = await User.aggregate([
      {
        $match: {
          email: req.email,
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
          pipeline: [
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post",
                as: "likeDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "likeDetails.user",
                foreignField: "_id",
                as: "likedByUsers",
                pipeline: [ 
                  {
                    $project: {
                      _id: 1,
                      email: 1,
                      userName: 1,
                      fullName: 1,
                      profileImage: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "commentDetails",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "commenterDetails",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            email: 1,
                            userName: 1,
                            fullName: 1,
                            profileImage: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: "$commenterDetails",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      comment_text: 1,
                      commenterId: "$commenterDetails._id",
                      commenterEmail: "$commenterDetails.email",
                      commenterUserName: "$commenterDetails.userName",
                      commenterFullName: "$commenterDetails.fullName",
                      commenterProfileImage: "$commenterDetails.profileImage",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $project: {
          email: 1,
          userName: 1,
          fullName: 1,
          dob: 1,
          gender: 1,
          profileImage: 1,
          posts: {
            $map: {
              input: "$posts",
              as: "post",
              in: {
                _id: "$$post._id",
                content: "$$post.content",
                image: "$$post.image",
                likedByUsers: "$$post.likedByUsers",
                commentDetails: "$$post.commentDetails",
                likesCount: { $size: "$$post.likeDetails" },
                commentsCount: { $size: "$$post.commentDetails" },
              },
            },

          },
          postsCount: { $size: "$posts" },
        },
      },
    ]);
    if (!user) {
      throw new ApiError(404, "User not found Please login again");
    }
    console.log("User profile retrieved: ", user);
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User profile retrieved successfully"));
  } catch (error) {
    console.error("Error while fetching user profile: ", error);
    throw new ApiError(500, "Error while fetching user profile");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.email });
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  console.log("User found for update: ", user);
  const { fullName, dob, gender } = req.body;
  const profileImagePath = req.files?.profileImage?.[0].path || null;

  let profileImage;
  if (profileImagePath)
    profileImage = await uploadOnCloudinary(profileImagePath);
  console.log(profileImage);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        fullName: fullName || user.fullName,
        dob: dob || user.dob,
        gender: gender || user.gender,
        profileImage: profileImage?.url || user?.profileImage || "",
      },
      { new: true }
    ).select("-password -refreshToken");
    if (!updatedUser) {
      throw new ApiError(500, "Error while updating user on DB");
    }
    console.log("User updated successfully: ", updatedUser);
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
  } catch (error) {
    console.error("Error while updating user: ", error);
    throw new ApiError(500, "Error while updating user");
  }
});

const uploadPost = asyncHandler(async (req, res) => {
  console.log("User email from token: ", req.email);
  const user = await User.findOne({ email: req.email });
  console.log("User found for uploading post: ", user);
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  console.log("User uploading post: ", user);
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Post content is required");
  }
  const postImagePath = req.files?.postImage?.[0].path || null;
  if (!postImagePath) {
    console.error("Post image not found in request: ", req.files);
  }
  let postImage;
  if (postImagePath) {
    postImage = await uploadOnCloudinary(postImagePath);
  }
  console.log(postImage);
  if (!postImage) {
    console.error("Error while uploading post image to Cloudinary");
  }
  try {
    const post = await Post.create({
      content,
      image: postImage?.url || "",
      author: user._id,
    });
    if (!post) {
      throw new ApiError(500, "Error while uploading post on DB");
    }
    console.log("Post uploaded successfully: ", post);
    return res
      .status(200)
      .json(new ApiResponse(200, post, "Post uploaded successfully"));
  } catch (error) {
    console.error("Error while uploading post: ", error);
    throw new ApiError(500, "Error while uploading post");
  }
});
const likePost = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.email });
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  const { postId } = req.body;
  if (!postId) {
    throw new ApiError(400, "Post ID is required");
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
    const existingLike = await Like.findOne({ user: user._id, post: postId });
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      post.likesCount = Math.max(0, post.likesCount - 1);
      console.log("Post unliked by user: ", user.email);
    } else {
      await Like.create({
        user: user._id,
        post: postId,
      });
      post.likesCount += 1;
      console.log("Post liked by user: ", user.email);
    }
    await post.save();
    return res
      .status(200)
      .json(new ApiResponse(200, post, "Post liked/unliked successfully"));
  } catch (error) {
    console.error("Error while liking/unliking post: ", error);
    throw new ApiError(500, "Error while liking/unliking post");
  }
});
const commentOnPost = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.email });
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  console.log("User commenting on post: ", user);
  const { postId, comment_text } = req.body;
  if (!postId || !comment_text) {
    throw new ApiError(400, "Post ID and comment content are required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  console.log("Post found for commenting: ", post);
  try {
    const comment = await Comment.create({
      comment_text: comment_text,
      user: user._id,
      post: post._id,
    });
    if (!comment) {
      throw new ApiError(500, "Error while adding comment to DB");
    }
    post.commentsCount += 1;
    await post.save();
    console.log("Comment added to post: ", comment);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { comment, post }, "Comment added successfully")
      );
  } catch (error) {
    console.error("Error while adding comment: ", error);
    throw new ApiError(500, "Error while adding comment");
  }
});
const getallPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.email });
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likeDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likeDetails.user",
          foreignField: "_id",
          as: "likedByUsers",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentDetails",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "commenterDetails",
              },

            },
            {
              $unwind: {
                path: "$commenterDetails",
                preserveNullAndEmptyArrays: true
              },
            },
            {
              $project: {
                comment_text: 1,
                commenterId: "$commenterDetails._id",
                commenterEmail: "$commenterDetails.email",
                commenterUserName: "$commenterDetails.userName",
                commenterFullName: "$commenterDetails.fullName",
                commenterProfileImage: "$commenterDetails.profileImage",
              },
            }
          ],
        },
      },
      {
        $project: {
          content: 1,
          image: 1,
          authorDetails: 1,
          likedByUsers: {
            _id: 1,
            email: 1,
            userName: 1,
            fullName: 1,
            profileImage: 1,
          },
          commentDetails: 1,
          likesCount: { $size: "$likeDetails" },
          commentsCount: { $size: "$commentDetails" },
        },
      },
    ]);
    if (!posts) {
      throw new ApiError(500, "Error while fetching posts from DB");
    }
    console.log("Posts retrieved successfully: ", posts);
    return res
      .status(200)
      .json(new ApiResponse(200, posts, "Posts retrieved successfully"));
  } catch (error) {
    console.error("Error while fetching posts: ", error);
    throw new ApiError(500, "Error while fetching posts");
  }
});
const getMyPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.email });
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  try {
    const posts = await Post.aggregate([
      {
        $match: {
          author: user._id,
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likeDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likeDetails.user",
          foreignField: "_id",
          as: "likedByUsers",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentDetails",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "commenterDetails",
              },
            },
          ],
        },
      },
      {
        $project: {
          content: 1,
          image: 1,

          likedByUsers: {
            _id: 1,
            email: 1,
            userName: 1,
            fullName: 1,
            profileImage: 1,
          },
          commentDetails: {
            comment_text: 1,
            commenterDetails: {
              _id: 1,
              email: 1,
              userName: 1,
              fullName: 1,
              profileImage: 1,
            },
          },
          likesCount: { $size: "$likeDetails" },
          commentsCount: { $size: "$commentDetails" },
        },
      },
    ]);
    if (!posts) {
      throw new ApiError(500, "Error while fetching posts from DB");
    }
    console.log("My posts retrieved successfully: ", posts);
    return res
      .status(200)
      .json(new ApiResponse(200, posts, "My posts retrieved successfully"));
  } catch (error) {
    console.error("Error while fetching my posts: ", error);
    throw new ApiError(500, "Error while fetching my posts");
  }
});
export {
  registerUser,
  sendVerificationCode,
  verifyUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUser,
  uploadPost,
  likePost,
  commentOnPost,
  getallPosts,
  getMyPosts,
};
