import mongoose, { Schema } from "mongoose";

const codeSchema = new Schema(
  {
    email: {
        type: String,
        required: true,
        trim: true,
    },
    verificationcode: {
        type: String,
        required: true,
        trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Code = mongoose.model("Code", codeSchema);
