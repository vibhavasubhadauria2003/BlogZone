import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, //cloudinary url
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const Post = mongoose.model("Post", postSchema);
