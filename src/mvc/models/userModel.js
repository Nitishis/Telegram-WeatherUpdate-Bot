import mongoose from "mongoose";

// Define a User schema for subscriptions
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  isSubscribed: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  subscriptionDate: { type: Date, default: Date.now },
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

export default User;
