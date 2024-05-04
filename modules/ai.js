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
  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "tinydolphin",
      messages: [
        {
          role: "user",
          content: text,
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
