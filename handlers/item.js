const Discord = require("discord.js");
const axios = require("axios").default
const chalk = require("chalk");
const fs = require("fs");
const builder = require('@discordjs/builders')

module.exports.run = async (client, interaction) => {
    const name = await interaction.options.getString("name");
    const req = await axios.get("https://fortniteapi.io/v2/items/list", {
        params : {
            lang : "en",
            name : name
        },
        headers : {
            Authorization : process.env.FNAPIIO
        }
    })
    .catch(console.error)
    if(req) {
        let items = req.data.items
        if(items.length) {
            let item = items[0]
            let embed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`Showing item info for : ${item.name}`)
            .setThumbnail(item.images.icon_background)
            .setDescription(item.description)
            .setImage(item.images.full_background)
            .addFields([
                {name : "Name", value : item.name},
                {
                    name : "ID", value : item.id
                },
                {
                    name : "Gameplay Tags", value : builder.codeBlock(item.gameplayTags.join("\n"))
                },
                 { name : "Type", value : item.type.name}
            ])
            if(item.set) embed.addField(`Set Info for ${item.set.id}`, `${builder.bold(item.set.name)}\n\n${item.set.partOf}`)
            return interaction.reply({embeds : [embed]})
        } else {
            return interaction.reply({embeds :[
                new Discord.MessageEmbed()
                .setTitle(`OOPS! Didn't find ${name}`)
                .setColor("RED")
                .setDescription("Please provide a correct name :)")
            ]})
        }
    } else {
        return interaction.reply({embeds : [
            new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("API ERROR. Please try later :)")
        ]})
    }
}