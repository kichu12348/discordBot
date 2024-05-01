const { Client, GatewayIntentBits } = require("discord.js");
const {handleMesaage} = require("./modules/message");

const botToken =
  "MTIwMTE0MDM5ODIxOTg3MDI4OA.GeRbOU.pbk_ygerwz4zPDOFL7DBY-Zu2C19_0d-JrEBt0";
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