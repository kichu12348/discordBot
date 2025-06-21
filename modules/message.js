const { generateText, sendLongResponse } = require("./ai");
const { EmbedBuilder } = require("discord.js");

const handleMessage = async (message) => {
  try {
    // Ignore bot messages
    if (message.author.bot) return;

    // Skip if message is too long
    if (message.content.length >= 1000) {
      if (message.mentions.users.has(message.client.user.id)) {
        message.reply({
          content: "bestie that's way too long, I'm not reading all that 💀",
        });
      }
      return;
    }

    // Create message object for AI processing
    const messageObj = {
      content: message.content,
      author: message.author,
      channelId: message.channel.id,
      client: message.client,
      mentions: message.mentions,
      reference: message.reference,
    };

    const aiResponse = await generateText(messageObj, () =>
      message.channel.sendTyping()
    );

    // Only respond if AI decides to
    if (aiResponse) {
      // await message.channel.sendTyping();

      const messageChunks = sendLongResponse(aiResponse.text);

      // Handle case where there's only a GIF
      if (
        (!aiResponse.text || aiResponse.text.trim() === "") &&
        aiResponse.gifUrl
      ) {
        await message.reply({
          embeds: [new EmbedBuilder().setImage(aiResponse.gifUrl)],
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      for (let i = 0; i < messageChunks.length; i++) {
        const chunk = messageChunks[i];
        if (!chunk || chunk.trim() === "") continue;

        const messageOptions = {
          content: chunk,
          allowedMentions: { repliedUser: false },
        };

        // Add embed with GIF to the first message chunk
        if (i === 0 && aiResponse.gifUrl) {
          messageOptions.embeds = [
            new EmbedBuilder().setImage(aiResponse.gifUrl),
          ];
        }

        if (i === 0) {
          await message.reply(messageOptions);
        } else {
          await message.channel.send(messageOptions);
        }
      }
    }
  } catch (error) {
    console.log(error);
    if (message.mentions.users.has(message.client.user.id)) {
      message.reply({
        content: "something went wrong and it's probably your fault 🙄",
      });
    }
  }
};

module.exports = {
  handleMessage,
};
