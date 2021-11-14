const Discord = require("discord.js");
const axios = require("axios").default
const chalk = require("chalk");
const fs = require("fs");

module.exports.run = async (client, interaction) => {
    let req = await axios.get("https://fortool.fr/cm/api/v1/shop/?lang=en")
    .catch(console.error)
    if(!req) return interaction.reply({content : "An error occured, please try later :)"})
    req = req.data
    // Get a random string of 12 length
    let randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setImage(req.images.default + `?c=${randomString}`)
    .setTitle("Shop of today")
    .setFooter("Updated at : ", interaction.user.avatarURL())
    .setTimestamp(req.refresh.image)
    interaction.reply({embeds : [embed]})
}