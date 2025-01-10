import mongoose from "mongoose";
import { MONGO_URI } from "./env";

const connectDB = async () => {
  try {
    const uri = MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected to database");
  } catch (error) {
    throw new Error("Error connecting to database: " + error);
  }
};

export default connectDB;
