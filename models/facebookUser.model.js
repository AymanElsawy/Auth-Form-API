import mongoose from "mongoose";

// user schema
const fbUserSchema = mongoose.Schema(
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

const User = mongoose.model("FbUser", fbUserSchema);

export default User;
