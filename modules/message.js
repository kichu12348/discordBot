const { generateText } = require("./ai");
const{handleNano} = require("./nano");

const handleMesaage = async (message) => {
  try {
    if (message.author.bot) return;
    else if (message.author.username === "malavikagk_35334" && !message.content.toLowerCase().includes("/ai")) {
      //malavikagk_35334
      handleNano(message);
    }
    if (message.content.toLowerCase().includes("/ai")) {
      if (message.content.split("/ai")[1] === "" || null) return;
      if (message.content.split("/ai")[1].length > 1000) {
        message.reply({
          content: "I'm sorry, I can only process upto 1000 characters.",
        });
        return;
      }
      const aiResponse = await generateText(message.content.split("/ai")[1]);
      message.reply({
        content: aiResponse,
      });
    }
  } catch (error) {
    console.log(error);
    message.reply({
      content: "I'm sorry, Im unable to do that.",
    });
  }
};

module.exports = {
  handleMesaage,
};
