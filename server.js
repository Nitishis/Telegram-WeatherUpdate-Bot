import express from "express";
import connectDB from "./src/mvc/config/db.js";
import cors from "cors";
import bodyParser from "body-parser";
import bot from "./bot.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());




// Connect to MongoDB
connectDB();



const port = process.env.PORT;
// Start the server
app.listen(port || 5000, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Start the bot
bot.launch().then(() => {
  console.log("Bot is running...");
});
