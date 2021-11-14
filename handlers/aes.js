const Discord = require("discord.js");
const axios = require("axios").default
const chalk = require("chalk");
const fs = require("fs");

module.exports.run = async (client, interaction) => {
    let req = await axios.get("https://fortnite-api.com/v2/aes")
    .catch(console.error)
    if(!req) return interaction.reply({content : "An error occured, please try later :)"})
    req = req.data
    let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setTitle(`Current AES Keys for ${req.data.build}`)
    .setDescription(`The main AES Key for this build is : **${req.data.mainKey}**`)
    let dynkeys = req.data.dynamicKeys
    dynkeys.forEach(element => {
        if(element.pakFilename.includes(".pak")){
            embed.addField(`${element.pakFilename}`, `${element.key}`)
        }
    });
    interaction.reply({embeds : [embed]})
}