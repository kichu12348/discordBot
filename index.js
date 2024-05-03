const { Client, GatewayIntentBits } = require("discord.js");
const { handleMessage } = require("./modules/message");
const cluster = require("cluster");
require("dotenv").config();

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

console.log("Bot is running...");
