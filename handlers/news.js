const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");
module.exports.run = async (client, interaction) => {
  const gamemode = await interaction.options.getString("gamemode");
  let req = await axios({
    method: "get",
    url: `https://fortnite-api.com/v2/news/${gamemode}`,
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
      .setTitle("Fortnite News for " + gamemode.toUpperCase())
      .setImage(req.data.image)
      .setFooter(client.user.username, client.user.displayAvatarURL());
    interaction.reply({ embeds: [embed] });
    
  }
};
