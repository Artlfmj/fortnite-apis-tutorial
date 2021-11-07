const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");

module.exports.run = async (client, interaction) => {
  let req = await axios({
    url: "https://fortnite-api.com/v1/map",
    method: "get",
  }).catch((e) => {
    console.error(e.toJSON());
    return interaction.reply({
      content: "An error occured! Please try later :)",
    });
  });
  if (req) {
    req = req.data;
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Fortnite Map")
      .setImage(req.data.images.pois)
      .setFooter(client.user.username, client.user.displayAvatarURL());
    interaction.reply({ embeds: [embed] });
  }
};
