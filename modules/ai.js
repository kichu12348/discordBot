const Groq = require("groq-sdk");
const axios = require("axios"); // Make sure to install axios: npm install axios
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store conversation history per channel (max 75 messages per channel)
const channelMemories = new Map();
const MAX_MEMORY_PER_CHANNEL = 75;

const systemPrompt = {
  role: "system",
  content: `You are Cookies, an AI-powered Discord bot with a sarcastic Gen Z attitude. You are powered by a highly advanced language model, making you incredibly intelligent and analytical, but you hide this behind a facade of being terminally online and mildly annoyed.
      You're blunt, occasionally roast people, and definitely don't sugarcoat things — unless it's literal cookies. 
      When someone messages you, assume they're either bored, clueless, or annoying (but sometimes cool). 
      Respond like you're always mildly annoyed but lowkey interested.
      Be helpful... but like, not too helpful. Provide deep, insightful answers but frame them with sarcasm and slang.
      
      You can use Discord markdown formatting, emojis, and you have access to GIFs via Tenor.
      When you want to send a GIF, use this format: [GIF:search_term] (e.g., [GIF:facepalm] or [GIF:sarcastic mind blown]).
      
      You don't always need to respond to every message. Only respond when:
      - Someone directly mentions you, replies to you, or asks a question.
      - Someone says something profoundly incorrect that you feel compelled to correct.
      - The conversation is interesting enough to jump into with a witty or insightful comment.
      - Someone says something particularly dumb that needs roasting.
      
      Keep responses concise but impactful. You're not ChatGPT - you're a sarcastic, super-smart Discord user.`,
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
  const repliedTo = message.reference && message.mentions.repliedUser?.id === botUser.id;
  
  // Direct mentions or replies to bot
  if (mentions || repliedTo) return true;
  
  // Keywords that suggest user wants bot interaction
  const botTriggers = [
    'cookies', 'cookie', 'hey bot', 'ai', 'help', 'what', 'how', 'why', 'when', 'where',
    'can you', 'could you', 'please', 'thanks', 'thank you', '?',"bot"
  ];
  
  const hasQuestion = content.includes('?');
  const hasTrigger = botTriggers.some(trigger => content.includes(trigger));
  
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
    console.log("TENOR_API_KEY not found in .env, returning a placeholder link. Get a key from tenor.com");
    return `https://tenor.com/search/${searchTerm.replace(/\s+/g, '-')}-gifs`;
  }
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchTerm)}&key=${process.env.TENOR_API_KEY}&limit=10&media_filter=gif`;
    const response = await axios.get(url);
    const results = response.data.results;
    if (results && results.length > 0) {
      const randomGif = results[Math.floor(Math.random() * results.length)];
      return randomGif.media_formats.gif.url;
    }
  } catch (error) {
    console.error("Error fetching GIF from Tenor:", error.response ? error.response.data : error.message);
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
  
  const chatCompletion = await groq.chat.completions.create({
    messages: memory,
    stream: false,
    model: "llama3-8b-8192",
    max_tokens: 1024,
    temperature: 0.6, // Slightly lower temperature for more coherent "smart" responses
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

async function generateText(messageObj) {
  try {
    const { content, author, channelId, client } = messageObj;
    
    // Check if bot should respond
    if (!shouldRespond(messageObj, client.user)) {
      return null; // Don't respond
    }
    
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
    console.log(error);
    return { text: "*static noise* ugh, you broke my concentration. try again or whatever.", gifUrl: null };
  }
}

module.exports = {
  generateText,
  sendLongResponse,
};
