import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoute from "./routes/auth.js";

const app = express();

// enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(cors());

// load environment variables from .env
dotenv.config();

//static files
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/public/images",
  express.static(path.join(__dirname, "public/images"))
); //static files

//facebook auth

import { facebookAuth } from "./helpers/facebookAuth.js";
facebookAuth(app); // facebook auth

//google auth
import { googleAuth } from "./helpers/googleAuth.js";
googleAuth(app);

// connect to MongoDB

await mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api", authRoute);

// create express app and listen on port 3000

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
