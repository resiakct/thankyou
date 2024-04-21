 const axios = require("axios");

const Prefixes = ["Prime","prime"];

module.exports = {
  config: {
    name: "prime",
    version: "2.2.6",
    author: "JV Barcenas | Shikaki", // do not change
    role: 0,
    category: "ai",
    shortDescription: {
      en: "Asks AI for an answer.",
    },
    longDescription: {
      en: "Asks AI for an answer based on the user prompt.",
    },
    guide: {
      en: "{pn} [prompt]",
    },
  },
  onStart: async function ({ message, api, event, args }) {

  },
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find(
        (p) => event.body && event.body.toLowerCase().startsWith(p)
      );

      if (!prefix) {
        return;
      }

      const prompt = event.body.substring(prefix.length).trim();

      if (!prompt) {
        await api.sendMessage(
          "Kindly provide a question, and I'll strive to deliver an effective response. Your satisfaction is my top priority.",
          event.threadID
        );
        return;
      }

      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      const response = await axios.get(
        `https://pi.aliestercrowley.com/api?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`
      );

      if (response.status !== 200 || !response.data) {
        throw new Error("Invalid or missing response from API");
      }

      const messageText = response.data.response;

      message.reply(`${messageText}`, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
          });
        }
      });

      api.setMessageReaction("✅", event.messageID, () => { }, true);
    } catch (error) {
      console.error("Error in onChat:", error);
      await api.sendMessage(
        `Failed to get answer: ${error.message}`,
        event.threadID
      );
    }
  }
}; 
prime.js
