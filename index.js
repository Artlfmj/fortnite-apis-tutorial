require('dotenv').config()
const Discord = require('discord.js')
const axios = require('axios')
const chalk = require('chalk')
const fs = require('fs')
const { intersection } = require('lodash')

const client = new Discord.Client({
    intents : ['GUILDS', "GUILD_MESSAGES", "GUILD_MEMBERS"]
})

client.on("ready", async() => {
    console.log(chalk.bold.green(`Discord Bot ${client.user.tag} is online!`))
    const commands = await client.application.commands.fetch()
    const mapslash = require('./slash-json/map.json')
    /*if(!commands.has("map")){
        console.log(chalk.red("Map command isn't registered"))
        client.application.commands.create(mapslash)
        .catch(e => {
            console.error(e)
        })
        .then(slash => {
            console.log(`Slash command ${slash.name} is now being deployed.`)
        })
    }*/
})

client.on('interactionCreate', async(interaction) => {
    if(interaction.isCommand()){
        if(interaction.commandName === "map"){
            let req = await axios({
                url : "https://fortnite-api.com/v1/map",
                method : "get"
            })
            .catch(e => {
                console.error(e.toJSON())
                return interaction.reply({"content" : "An error occured! Please try later :)"})
            })
            if(req){
                req = req.data
                const embed = new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setTitle("Fortnite Map")
                .setImage(req.data.images.pois)
                .setFooter(client.user.username, client.user.displayAvatarURL())
                interaction.reply({embeds : [embed]})
                console.log(chalk.gray(`Responded to ${interaction.user.username}(${interaction.user.id}) | Map Slash Command`))
            }
        }
    }
})

client.login(process.env.TOKEN)