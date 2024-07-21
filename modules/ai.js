const Groq = require('groq-sdk')

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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function Main(message,user) {
  const chatCompletion = await getGroqChatCompletion(message,user);
  return chatCompletion.choices[0]?.message?.content || "";
}

async function getGroqChatCompletion(message,user) {
    if(!message) return
  return groq.chat.completions.create({
    messages: [
        {
        role: "system",
        content: `you are a discord bot named cookies and you got message from ${user}`,
        },
      {
        role: "user",
        content: message,
      },
    ],
    stream: false,
    model: "llama3-8b-8192",
    max_tokens: 1024,
    temperature: 0.5,
  });
}



async function generateText(text,user="@cookie") {
  try {
    const response = await Main(text,user);
    const message = sendLongResponse(response);
    return message;
  } catch (error) {
    console.log(error);
    return "I'm sorry, I was unable to do that.";
  }
}

module.exports = {
  generateText,
};
