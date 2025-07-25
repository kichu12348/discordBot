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

const checkEnvVariables = () => {
  const botToken = process.env.BOT_TOKEN;
  const tenApiKey = process.env.TENOR_API_KEY;
  const openAIApiKey = process.env.OPEN_AI_API_KEY;
  const baseURL = process.env.OPEN_AI_API_BASE_URL;

  if (!botToken)
    console.log("Error: BOT_TOKEN is not set in the environment variables.");

  if (!tenApiKey)
    console.log(
      "Error: TENOR_API_KEY is not set in the environment variables."
    );

  if (!openAIApiKey)
    console.log("Error: OPEN_AI_API_KEY is not set in the environment variables.");

  if (!baseURL)
    console.log(
      "Error: OPENAI_API_BASE_URL is not set in the environment variables."
    );

  if (botToken && tenApiKey && openAIApiKey && baseURL) {
    console.log("All required environment variables are set. Bot is ready to start!");
  }
};

checkEnvVariables();

console.log("Bot is starting up...😎");
