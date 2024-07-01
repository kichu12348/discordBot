const { Client, GatewayIntentBits } = require("discord.js");
const { handleMessage } = require("./modules/message");
// const { connectToDB } = require("./modules/store");
const express = require("express");
const app = express();

//connectToDB(process.env.MONGO_URI);
//hellowww
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", handleMessage);

client.login(process.env.BOT_TOKEN);

app.get("/", (req, res) => {
  res.json({
    message:"i am aliveee💀"
  })
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...🚀");
});

console.log("Bot is running...😎");

