const axios = require("axios");

async function generateText(text) {
  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama2",
      messages: [
        {
          role: "user",
          content: text + ". also keep it under 1000 characters please.",
        },
      ],
      stream: false,
      options:{
        temperature: 0.7,
      },
    });
    const message = response.data.message.content < 2000 ? response.data.message.content : response.data.message.content.slice(0, 2000);

    return message;
  } catch (error) {
    console.log(error);
    return "I'm sorry, Im unable to do that.";
  }
}

module.exports = {
  generateText,
}

