const { generateText, sendLongResponse } = require("./ai");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

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
      if (aiResponse.banInfo) {
        if (
          !message.guild.members.me.permissions.has(
            PermissionsBitField.Flags.BanMembers
          )
        ) {
          await message.channel.send(
            "LMAO you really thought? I don't even have perms to ban people. ask an admin to fix it if you want me to have my ban hammer."
          );
        } else {
          try {
            const memberToBan = await message.guild.members.fetch(
              aiResponse.banInfo.userId
            );
            if (memberToBan && memberToBan.bannable) {
              await memberToBan.ban({
                reason: `Banned by Cookies for 1 minute. Reason: ${aiResponse.text}`,
              });
              setTimeout(async () => {
                try {
                  await message.guild.members.unban(
                    aiResponse.banInfo.userId,
                    "1-minute ban expired."
                  );
                } catch (unbanError) {
                  console.error(
                    `Failed to unban ${aiResponse.banInfo.userId}:`,
                    unbanError
                  );
                }
              }, 60 * 1000); // 1 minute
            } else {
              aiResponse.text =
                "lol, tried to ban them but I can't. guess they're too powerful... or I'm too weak. whatever.";
            }
          } catch (banError) {
            console.error("Failed to ban user:", banError);
            aiResponse.text =
              "ugh, my ban hammer is broken. you're safe... for now.";
          }
        }
      }

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
