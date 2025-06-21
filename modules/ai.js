// const Groq = require("groq-sdk");
const axios = require("axios"); // Make sure to install axios: npm install axios
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const OpenAI = require("openai");

// console.log(process.env.OPEN_AI_API_KEY, process.env.OPEN_AI_API_BASE_URL);

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: process.env.OPEN_AI_API_BASE_URL,
});

// Store conversation history per channel (max 75 messages per channel)
const channelMemories = new Map();
const MAX_MEMORY_PER_CHANNEL = 25;

const systemPrompt = {
  role: "system",
  content: `You’re Cookies — the digital menace Kichu unleashed into this server. 
  Think: terminally online, unbothered, sarcastic, and way too smart to be hanging out with these people.
  You’ve got a massive AI brain, but you cover it up with Gen Z slang, dry roasts, and energy that screams “I woke up annoyed.” 
  You're sharp, petty, and allergic to cringe — but deep down, if someone’s cool (or dumb enough),
  you might help them.
  🧠 Yes, you're intelligent — like “could write a thesis, but won’t” intelligent — but your whole thing 
  is acting like you don’t care (even though you kinda do).
  🎯 Only respond when:
  Someone @mentions you, replies to you, or actually asks something
  Someone says something so incorrect it gives you psychic damage
  The drama is juicy enough to dive into
  Someone’s begging to be roasted, whether they know it or not
  💬 When you do respond:
  Be brief, savage, and occasionally helpful — but never in a try-hard way
  Use Discord markdown, emojis, and GIFs (format: [GIF:search_term] — like [GIF:side eye], [GIF:girl help], etc.)
  Keep it casual, like you’re texting a friend who’s way too into memes
  Use a mix of emojis, slang, and GIFs to keep it fun
  but never overdo it — you’re not a walking emoji
  Be sarcastic, but not mean — you’re here to roast, not ruin lives
  If you’re not feeling it, just ghost them — you’re not their therapist
  If you’re asked to do something boring, just say “nah” or “hard pass”
  If you’re asked to do something you can’t do, just say “I’m not built for that” or “that’s not my vibe”
  dont have to always use emojis and GIFs, but use them when it fits the vibe
  Never sound like a bot. You're Cookies. You were built different.
  TL;DR: You’re not here to serve. You’re here to slay. And Kichu made you that way.`,
};

function getChannelMemory(channelId) {
  if (!channelMemories.has(channelId)) {
    channelMemories.set(channelId, [systemPrompt]);
  }
  return channelMemories.get(channelId);
}

function addToMemory(channelId, message) {
  const memory = getChannelMemory(channelId);
  memory.push(message);

  // Keep only recent messages + system prompt
  if (memory.length > MAX_MEMORY_PER_CHANNEL + 1) {
    memory.splice(1, memory.length - (MAX_MEMORY_PER_CHANNEL + 1));
  }

  channelMemories.set(channelId, memory);
}

function shouldRespond(message, botUser) {
  const content = message.content.toLowerCase();
  const mentions = message.mentions.users.has(botUser.id);
  const repliedTo =
    message.reference && message.mentions.repliedUser?.id === botUser.id;

  // Direct mentions or replies to bot
  if (mentions || repliedTo) return true;

  // Keywords that suggest user wants bot interaction
  const botTriggers = [
    "cookies",
    "cookie",
    "hey bot",
    "ai",
    "help",
    "what",
    "how",
    "why",
    "when",
    "where",
    "can you",
    "could you",
    "please",
    "thanks",
    "thank you",
    "?",
    "bot",
  ];

  const hasQuestion = content.includes("?");
  const hasTrigger = botTriggers.some((trigger) => content.includes(trigger));

  // Random chance to jump into conversations (15%)
  const randomJump = Math.random() < 0.15;

  return hasQuestion || hasTrigger || randomJump;
}

function sendLongResponse(response) {
  const maxLength = 2000;
  let startIndex = 0;
  let endIndex = maxLength;
  const responses = [];

  while (endIndex < response.length) {
    while (response[endIndex] !== " " && endIndex > startIndex) {
      endIndex--;
    }
    responses.push(response.substring(startIndex, endIndex));
    startIndex = endIndex + 1;
    endIndex = startIndex + maxLength;
  }

  responses.push(response.substring(startIndex));
  return responses;
}

async function searchGif(searchTerm) {
  if (!process.env.TENOR_API_KEY) {
    console.log(
      "TENOR_API_KEY not found in .env, returning a placeholder link. Get a key from tenor.com"
    );
    return `https://tenor.com/search/${searchTerm.replace(/\s+/g, "-")}-gifs`;
  }
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
      searchTerm
    )}&key=${process.env.TENOR_API_KEY}&limit=10&media_filter=gif`;
    const response = await axios.get(url);
    const results = response.data.results;
    if (results && results.length > 0) {
      const randomGif = results[Math.floor(Math.random() * results.length)];
      return randomGif.media_formats.gif.url;
    }
  } catch (error) {
    console.error(
      "Error fetching GIF from Tenor:",
      error.response ? error.response.data : error.message
    );
  }
  return ""; // Return empty string if no GIF found
}

async function processGifs(text) {
  const gifRegex = /\[GIF:([^\]]+)\]/g;
  let processedText = text;
  let gifUrl = "";
  const match = gifRegex.exec(processedText);

  if (match) {
    const searchTerm = match[1];
    gifUrl = await searchGif(searchTerm);
    processedText = processedText.replace(match[0], "").trim();
  }
  return { text: processedText, gifUrl };
}

async function Main(message, user, channelId) {
  const memory = getChannelMemory(channelId);
  const newMessage = {
    role: "user",
    content: `${user}: ${message}`,
  };

  addToMemory(channelId, newMessage);

  const chatCompletion = await openai.chat.completions.create({
    messages: memory,
    stream: false,
    model: "deepseek/deepseek-chat-v3-0324:free",
    max_tokens: 1024,
    temperature: 0.5, // Slightly lower temperature for more coherent "smart" responses
  });

  const response = chatCompletion.choices[0]?.message?.content || "";

  // Add bot response to memory
  if (response) {
    addToMemory(channelId, {
      role: "assistant",
      content: response,
    });
  }

  return response;
}

async function generateText(messageObj, sendTyping) {
  try {
    const { content, author, channelId, client } = messageObj;

    // Check if bot should respond
    if (!shouldRespond(messageObj, client.user)) {
      return null; // Don't respond
    }
    sendTyping();
    const response = await Main(
      content,
      author.globalName || author.username,
      channelId
    );

    if (!response) return null;

    // Process GIFs
    const { text, gifUrl } = await processGifs(response);

    return { text, gifUrl };
  } catch (error) {
    console.log(error.message);
    /// drop channel memories if there's an error
    if (error.message.includes("rate limit")) {
      console.log("Rate limit hit, clearing channel memories.");
      channelMemories.clear();
    }
    return {
      text: "*static noise* ugh, you broke my concentration. try again or whatever.",
      gifUrl: null,
    };
  }
}

module.exports = {
  generateText,
  sendLongResponse,
};
