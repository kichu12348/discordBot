const { Client, GatewayIntentBits } = require("discord.js");
const { handleMesaage } = require("./modules/message");
require("dotenv").config();

//hellowww
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", handleMesaage);

client.login(process.env.BOT_TOKEN);

console.log("Bot is running...");
