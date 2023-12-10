import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import joi from "joi";

export async function register(req, res) {
  if (!req.file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Photo is required" });
  }
  const image = `${req.protocol}://${req.get("host")}/public/images/${
    req.file.filename
  }`;
  const newEmail = req.body.email;
  const findEmail = await User.findOne({ email: newEmail }); // check if email already exists
  if (findEmail) {
    // check if email already exists
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "Email already exists" });
  }
  const userSchema = joi.object({
    name: joi.string().required().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required",
    }),
    email: joi.string().email().required().messages({
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: joi.string().required().min(6).max(30).messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be at most 30 characters",
    }),
    repeat_password: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "string.empty": "Repeat password is required",
        "any.required": "Repeat password is required",
        "any.only": "Passwords do not match",
      }),
    phone: joi
      .string()
      .pattern(/^0[0-9]{10}$/)
      .required()
      .messages({
        "string.empty": "Phone is required",
        "any.required": "Phone is required",
        "string.pattern.base": "Phone must be a valid Egyptian phone number",
      }),
    address: joi.string().required().messages({
      "string.empty": "Address is required",
      "any.required": "Address is required",
    }),
  });

  const { error } = userSchema.validate(req.body); // validate user input
  if (error) {
    // validate user input
    // console.log(error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid input", message: error.details[0].message });
  }

  const salt = bcrypt.genSaltSync(10); // generate salt
  const hash = bcrypt.hashSync(req.body.password, salt); // hash password

  const newUser = new User({
    // create new user
    name: req.body.name,
    email: req.body.email,
    password: hash,
    phone: req.body.phone,
    address: req.body.address,
    photo: image,
  });

  User.create(newUser) // create user
    .then((user) => {
      // if user created
      const token = jwt.sign( // generate token
        { // payload
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          photo: user.photo,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d", // token expires in 1 day
        }
      );
      return res
        .status(StatusCodes.CREATED) // return status code
        .json({ message: "User created successfully", token }); // return user
    })
    .catch((err) => {
      // if user not created
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR) // return status code
        .json({ message: "User not created", error: err.message }); // return error
    });
}

