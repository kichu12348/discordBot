const { Client, GatewayIntentBits } = require("discord.js");
const { handleMessage } = require("./modules/message");
const { connectToDB } = require("./modules/store");
const{generateText} = require("./modules/ai");
require("dotenv").config();

connectToDB(process.env.MONGO_URI);
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

// async function test(){
//   const message = await generateText("how are you ?");
//   console.log(message);
// }

// test();