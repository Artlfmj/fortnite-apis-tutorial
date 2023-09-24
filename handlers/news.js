const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const gamemode = await interaction.options.getString("gamemode");
    
    const response = await axios.get(`https://fortnite-api.com/v2/news/${gamemode}`);

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const data = response.data.data;

    if (!data || !data.image) {
      throw new Error("Invalid response data from Fortnite API");
    }

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(`Fortnite News for ${gamemode.toUpperCase()}`)
      .setImage(data.image)
      .setFooter(client.user.username, client.user.displayAvatarURL());

    interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite News command:", error.message));
    interaction.reply({
      content: "An error occurred! Please try again later :)",
    });
  }
};
