const { Client, GatewayIntentBits } = require("discord.js");
const { handleMessage } = require("./modules/message");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", handleMessage);

client.on("ready", () => {
  console.log(`${client.user.tag} is now online and ready to be sarcastic! 😎`);
});

client.login(process.env.BOT_TOKEN);

console.log("Bot is starting up...😎");

