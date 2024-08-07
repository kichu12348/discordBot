const { generateText } = require("./ai");
const { handleNano } = require("./nano");

const handleMessage = async (message) => {
  try {
    if (message.author.bot) return;
    if (
      message.author.username === "malavikagk_35334" ||
      message.author.username === "gokul.b" &&
        !message.content.toLowerCase().includes("/ai") 
        && !message.content.toLowerCase().includes("/store")
        && !message.content.toLowerCase().includes("/get")
        && Math.floor(Math.random() * 50) === 5
    ) {
      //malavikagk_35334
      handleNano(message);
      return;
    }
    if (message.content.toLowerCase().includes("/ai")) {
      if (message.content.split("/ai")[1] === "" || null) return;
      if (message.content.split("/ai")[1].length >= 1000) {
        message.reply({
          content: "I'm sorry, I can only process upto 1000 characters.",
        });
        return;
      }
      message.channel.sendTyping();
      const aiResponse = await generateText(message.content.split("/ai")[1],`@${message.author.username}`);
      for (let i = 0; i < aiResponse.length; i++) {
        if (i === 0) {
          message.reply({
            content: aiResponse[i],
          });
        } else {
          message.channel.send({
            content: aiResponse[i],
          });
        }
      }
    }

  } catch (error) {
    console.log(error);
    message.reply({
      content: "I'm sorry, I was unable to process your request.",
    });
  }
};

module.exports = {
  handleMessage,
};
