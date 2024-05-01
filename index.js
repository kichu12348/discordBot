const { Client, GatewayIntentBits } = require("discord.js");
const {handleMesaage} = require("./modules/message");
require("dotenv").config();


//hellowww
const botToken = process.env.BOT_TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", handleMesaage);

client.login(botToken);

console.log("Bot is running...");