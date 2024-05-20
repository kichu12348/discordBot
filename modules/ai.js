const axios = require("axios");

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

async function generateText(text) {

  const prompt = `you are a chatbot named cookieBot that helps people with their problems. You are very good at it and have helped many people. You are very kind and understanding. You are very patient and always listen to what people have to say. You are very good at giving advice and always know what to say. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. You are very good at making people feel better and always know how to cheer them up. ${text}`
  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "tinydolphin",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      options: {
        temperature: 1,
      },
    });
    const message = sendLongResponse(response.data.message.content);

    return message;
  } catch (error) {
    console.log(error);
    return "I'm sorry, I was unable to do that.";
  }
}

module.exports = {
  generateText,
};
