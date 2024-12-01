import { Telegraf } from "telegraf";
import User from "./src/mvc/models/userModel.js";
import { getWeather } from "./src/Weather.js";
import dotenv from "dotenv";

dotenv.config();

// Telegram bot token
const bot = new Telegraf(process.env.TELEGRAM_BOT_API);

// Global states for the bot session
let awaitingCityInput = false; // To track if we're waiting for the city name
let isBotActive = false; // To track the bot's active state
const userStates = {}; // To track last interaction time for each user

// Function to check if the user is subscribed
const isSubscribed = async (userId) => {
  const user = await User.findOne({ userId });
  return user ? user.isSubscribed : false;
};

// Function to check if the user is an admin
const isAdmin = async (userId) => {
  const user = await User.findOne({ userId });
  return user ? user.isAdmin : false;
};

// Function to restart the process if no interaction for 5 minutes
const resetUserState = (userId) => {
  awaitingCityInput = false;
  isBotActive = false;
  if (userStates[userId]) {
    delete userStates[userId];
  }
};

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;

  // Check if the user is subscribed
  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    ctx.reply(
      "Hello! Before using the bot, you need to subscribe. Type /subscribe to subscribe."
    );
    return;
  }

  isBotActive = true;
  awaitingCityInput = true;

  // Set last interaction time for the user
  userStates[userId] = Date.now();

  ctx.reply("Welcome! I am your weather bot. You can now start using me!");
  setTimeout(() => {
    ctx.reply("Please enter a city name:");
  }, 1000);
});

// Subscribe command
bot.command("subscribe", async (ctx) => {
  const userId = ctx.from.id;

  // Check if user is already subscribed
  const existingUser = await User.findOne({ userId });
  if (existingUser && existingUser.isSubscribed) {
    ctx.reply("You are already subscribed to the bot!");
    setTimeout(() => {
      ctx.reply("Please /start me to begin.");
    }, 1000);
    return;
  }

  // Save user to DB and mark them as subscribed
  await User.findOneAndUpdate(
    { userId },
    { $set: { isSubscribed: true } },
    { upsert: true }
  );

  ctx.reply(
    "Thank you for subscribing! You can now use the bot. Type /start to begin."
  );
});

// City name input and weather check
bot.on("message", async (ctx) => {
  console.log(ctx);
  
  const userMessage = ctx.message.text.toLowerCase();
  const userId = ctx.from.id;

  // Check for inactivity timeout
  const currentTime = Date.now();
  const lastInteraction = userStates[userId];

  if (lastInteraction && currentTime - lastInteraction > 5 * 60 * 1000) {
    resetUserState(userId); // Reset user state if inactive for 5 minutes
    ctx.reply("You were inactive for too long. Please /start again.");
    return;
  }

  // Update last interaction time
  userStates[userId] = currentTime;

  // Ensure user is subscribed before proceeding
  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    ctx.reply("Please subscribe first by typing /subscribe.");
    return;
  }

  if (awaitingCityInput) {
    // User is entering city name, check the weather
    try {
      const cityName = ctx.message.text.trim();
      const weatherReport = await getWeather(cityName); // Get weather for the city
      await ctx.reply(weatherReport); // Send weather report to the user

      // Ask if the user wants to check another city
      awaitingCityInput = false; // Stop awaiting city name
      ctx.reply(
        'Do you want to check the weather for another city? Type "yes" to continue or "no" to stop.'
      );
    } catch (error) {
      // If the city is not found, ask the user to try again
      ctx.reply(
        "Sorry, I couldn't find that city. Please enter a valid city name."
      );
    }
  } else {
    // Handle the "yes" or "no" responses
    if (userMessage === "yes") {
      awaitingCityInput = true; // Reset to city input mode
      ctx.reply("Please enter a city name:");
    } else if (userMessage === "no") {
      // End the bot process
      isBotActive = false;
      ctx.reply("Thank you for using the weather bot. Have a nice day!");
    } else {
      // Error handling for unexpected user input
      if (!isBotActive && ctx.message.text.toLowerCase() !== "/start") {
        ctx.reply("Please /start me to begin.");
      }
    }
  }
});

// Error handling for unexpected user input
bot.on("message", (ctx) => {
  const userId = ctx.from.id;

  if (!isSubscribed(userId)) {
    // If the user is not subscribed, remind them to subscribe
    ctx.reply("Please subscribe first by typing /subscribe.");
  }
});

export default bot;
