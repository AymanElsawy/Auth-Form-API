import mongoose from "mongoose";

// user schema
const socialUserSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    photo: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("SocialUser", socialUserSchema);

export default User;
