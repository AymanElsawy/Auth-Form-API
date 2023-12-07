import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();

// enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(cors());


// load environment variables from .env
dotenv.config();

// connect to MongoDB

await mongoose
  .connect("mongodb://127.0.0.1:27017/auth-form")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err.message);
  });

// create express app and listen on port 3000

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})
