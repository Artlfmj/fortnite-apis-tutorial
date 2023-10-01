const Discord = require("discord.js");
const axios = require("axios").default;
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const { data } = await axios.get("https://fortnite-api.com/v2/aes");

    if (!data || !data.data) {
      throw new Error("Invalid response from Fortnite API");
    }

    const { build, mainKey, dynamicKeys } = data.data;

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(`Current AES Keys for ${build}`)
      .setDescription(`The main AES Key for this build is: **${mainKey}**`);

    dynamicKeys.forEach((element) => {
      if (element.pakFilename.includes(".pak")) {
        embed.addField(`${element.pakFilename}`, `${element.key}`);
      }
    });

    interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    interaction.reply({ content: "An error occurred, please try again later :)" });
  }
};
