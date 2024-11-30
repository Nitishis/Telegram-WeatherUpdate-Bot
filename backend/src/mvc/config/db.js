import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

// MongoDB URI (replace with your MongoDB connection string)
const mongoURI = process.env.MONGO_CONNECT_STRING;

// Connect to MongoDB
const connectDB = () => {
  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));
};

export default connectDB;
