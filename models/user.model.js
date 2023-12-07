import mongoose from "mongoose";

// user schema
const userSchema = mongoose.Schema({
    name: String, 
    email: String,
    password: String,
    phone: String,
    address: String,
    photo: String,

}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;