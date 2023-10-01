const Discord = require("discord.js");
const axios = require("axios").default;
const chalk = require("chalk");
const fs = require("fs");

module.exports.run = async (client, interaction) => {
  await interaction.deferReply();
  let player = await interaction.options.getString('player');
  let req = await axios.get("https://fortniteapi.io/v1/lookup", {
    params: {
      username: player
    },
    headers: {
      Authorization: process.env.FNAPIIO
    }
  }).catch(console.error);

  if (!req) return interaction.editReply({ content: "An error occurred, please try later :)" });
  req = req.data;
  let cache = req;

  if (req.result) {
    req = await axios.get("https://fortniteapi.io/v1/stats", {
      params: {
        account: cache.account_id
      },
      headers: {
        Authorization: process.env.FNAPIIO
      }
    }).catch(console.error);

    if (!req) return interaction.editReply({ content: "An error occurred, please try later :)" });
    req = req.data;
    console.log(req);
    let global = req.global_stats;
    console.log(Math.round((global.squad.placetop1 + global.duo.placetop1 + global.solo.placetop1) / 3).toString());

    // Corrected calculation for average K.D.
    let averageKD = Math.round((global.squad.kd + global.duo.kd + global.solo.kd) / 3);

    let embed = new Discord.MessageEmbed()
      .setTitle(`Stats for ${req.name}`)
      .setColor("RANDOM")
      .addField("Battlepass Level", req.account.level.toString(), true)
      .addField("Victories", (global.squad.placetop1 + global.duo.placetop1 + global.solo.placetop1).toString(), true)
      .addField("Average K.D", averageKD.toString(), true)
      .addField("Total Kills", (global.squad.kills + global.duo.kills + global.solo.kills).toString(), true);

    interaction.editReply({ embeds: [embed] });
  } else {
    let embed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle(`There was an error`)
      .setDescription(`We were unable to get account info on ${player}`)
      .setFooter(req.error.code);

    interaction.editReply({ embeds: [embed] });
  }
}
