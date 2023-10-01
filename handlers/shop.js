const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");
const moment = require("moment");

const FORTNITE_API_KEY = process.env.FNAPIIO;
const SHOP_LANGUAGE = "en";
const DATE_FORMAT = "dddd, MMMM Do YYYY";
const ITEM_SIZE = {
  DoubleWide: {
    width: 1060,
    height: 1000,
  },
  Small: {
    width: 500,
    height: 480,
  },
  Normal: {
    width: 500,
    height: 1000,
  },
};

const FONT_OPTIONS = {
  fontFamily: "Burbank Big Regular",
  fontWeight: "Black",
};

module.exports.run = async (client, interaction) => {
  await interaction.deferReply("Loading shop image...");

  try {
    const shopItems = await getShopItems(FORTNITE_API_KEY, SHOP_LANGUAGE);
    const shopImage = await generateShopImage(shopItems);
    const attachment = new Discord.MessageAttachment(shopImage, "shop.jpg");
    await interaction.editReply({
      files: [attachment],
    });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite Shop command:", error.message));
    interaction.reply({
      content: "An error occurred! Please try again later :)",
    });
  }
};

async function generateShopImage(shopItems) {
  const beforeFinish = Date.now();
  // Font
  registerFont("./assets/fonts/BurbankBigRegularBlack.otf", {
    family: "Burbank Big Regular",
    style: "Black",
  });

  // Check shop
  if (!shopItems) {
    throw new Error("Failed to fetch shop items");
  }

  // Get the image width
  const keys = Object.keys(shopItems);
  let bigWidth = 0;

  for (let i of keys) {
    let curWidth = 250;
    i = shopItems[i].entries;

    i.forEach((el) => {
      if (el.size === "DoubleWide") curWidth += ITEM_SIZE.DoubleWide.width;
      else if (el.size === "Small") curWidth += ITEM_SIZE.Small.width;
      else if (el.size === "Normal") curWidth += ITEM_SIZE.Normal.width;
      else curWidth += ITEM_SIZE.Normal.width;
      curWidth += 60;
    });

    if (curWidth > bigWidth) bigWidth = curWidth;
  }

  // Make the image
  const canvasHeight = keys.length * 1200 + 1000;
  const canvasWidth = bigWidth;

  console.log(`[CANVAS] Width ${canvasWidth} x Height ${canvasHeight}`.green);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Starting points
  let featuredX = 150;
  let featuredY = 900;
  let rendered = 0;
  let below = false;

  // Background
  const background = await loadImage("./assets/background.png");
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  console.log("[WATERMARK] Drawing Date and Watermarks".yellow);

  // Item Shop
  ctx.fillStyle = "#ffffff";
  ctx.font = `italic 300px "${FONT_OPTIONS.fontFamily}"`;
  ctx.textAlign = "left";
  ctx.fillText("Item Shop", 170, 500);

  // Date
  ctx.font = `italic 125px "${FONT_OPTIONS.fontFamily}"`;
  ctx.textAlign = "right";
  ctx.fillText(moment().format(DATE_FORMAT), canvas.width - 100, 400);

  // Watermark
  const watermark = "CODE LFMRD #AD"; // Replace with your watermark
  if (watermark) ctx.fillText(watermark, canvas.width - 100, 550);

  // Start Rendering
  for (const i of keys) {
    const items = shopItems[i].entries;

    // Draw shop section name
    if (shopItems[i].name !== null) {
      console.log(`[SECTIONS] Drawing ${shopItems[i].name} Section`.magenta);

      ctx.fillStyle = "#ffffff";
      ctx.font = `italic 100px "${FONT_OPTIONS.fontFamily}"`;
      ctx.textAlign = "left";
      ctx.fillText(shopItems[i].name, 185, featuredY - 60);
      ctx.drawImage(
        await loadImage("./assets/clock.png"),
        ctx.measureText(shopItems[i].name).width + 200,
        featuredY - 160,
        125,
        125
      );
    }

    // Draw items
    for (const item of items) {
      console.log(`[ITEMS] Drawing ${item.name}`.blue);

      let itemImg;
      let ov;
      let imgWidth = 0;
      let imgHeight = 0;
      let wasBelow = false;

      // Get the image width/height
      if (item.size === "DoubleWide") {
        imgWidth = ITEM_SIZE.DoubleWide.width;
        imgHeight = ITEM_SIZE.DoubleWide.height;
        below = false;
        wasBelow = false;
      } else if (item.size === "Small") {
        imgWidth = ITEM_SIZE.Small.width;
        imgHeight = ITEM_SIZE.Small.height;
        if (below === true) {
          featuredX = featuredX - (imgWidth + 60);
          featuredY = featuredY + 520;
          below = false;
          wasBelow = true;
        } else {
          below = true;
          wasBelow = false;
        }
      } else if (item.size === "Normal") {
        imgWidth = ITEM_SIZE.Normal.width;
        imgHeight = ITEM_SIZE.Normal.height;
        below = false;
        wasBelow = false;
      } else {
        imgWidth = ITEM_SIZE.Normal.width;
        imgHeight = ITEM_SIZE.Normal.height;
        below = false;
        wasBelow = false;
      }

      // Load Overlay
      try {
        ov = await loadImage(
          `./assets/rarities/${
            item.series
              ? item.series.name
                  .toLowerCase()
                  .replace(/ /g, "")
                  .replace("series", "")
              : item.rarity.name
          }Down.png`
        );
      } catch {
        ov = await loadImage("./assets/rarities/UncommonDown.png");
      }

      // Load image
      if (item.images.background) {
        try {
          itemImg = await loadImage(item.images.background);
        } catch {
          console.log(`Could not load image for ${item.name}`.red);
          itemImg = await loadImage("./assets/placeholder.png");
        }
      } else if (item.images.icon) {
        try {
          itemImg = await loadImage(item.images.icon);
        } catch {
          console.log(`Could not load image for ${item.name}`.red);
          itemImg = await loadImage("./assets/placeholder.png");
        }
      } else {
        console.log(`Could not load image for ${item.name}`.red);
        itemImg = await loadImage("./assets/placeholder.png");
      }

      // Draw image
      if (item.size === "DoubleWide") {
        ctx.drawImage(itemImg, featuredX, featuredY, imgWidth, imgHeight);
        ctx.drawImage(
          ov,
          featuredX,
          featuredY + (imgHeight - 600),
          imgWidth,
          600
        );
      } else if (item.size === "Small") {
        ctx.drawImage(
          itemImg,
          imgWidth / 4.7,
          0,
          imgWidth + 300,
          imgHeight + 300,
          featuredX,
          featuredY,
          imgWidth,
          imgHeight
        );
        ctx.drawImage(
          ov,
          featuredX,
          featuredY + (imgHeight - 600),
          imgWidth,
          600
        );
      } else {
        ctx.drawImage(
          itemImg,
          imgWidth / 2,
          0,
          imgWidth,
          imgHeight,
          featuredX,
          featuredY,
          imgWidth,
          imgHeight
        );
        ctx.drawImage(
          ov,
          featuredX,
          featuredY + (imgHeight - 600),
          imgWidth,
          600
        );
      }

      // Load & Draw Name
      ctx.fillStyle = "#ffffff";
      let fontSize = 55;
      ctx.font = `italic ${fontSize}px "${FONT_OPTIONS.fontFamily}"`;

      let measure = ctx.measureText(item.name.toUpperCase()).width;
      while (measure > imgWidth - 40) {
        fontSize = fontSize - 0.6;
        ctx.font = `italic ${fontSize}px "${FONT_OPTIONS.fontFamily}"`;
        measure = ctx.measureText(item.name.toUpperCase()).width;
      }
      ctx.textAlign = "center";
      ctx.fillText(
        item.name.toUpperCase(),
        featuredX + imgWidth / 2,
        featuredY + (imgHeight - 400 / 7.5)
      );

      // Load & Draw Price
      ctx.fillStyle = "#d3d3d3";
      ctx.font = '30px "Burbank Big Rg Bk"';
      ctx.textAlign = "right";
      ctx.fillText(
        item.price.finalPrice.toLocaleString(),
        featuredX + (imgWidth - 500 / 6),
        featuredY + (imgHeight - 500 / 45)
      );

      ctx.drawImage(
        await loadImage("./assets/vbucks.png"),
        item.size === "DoubleWide" ? featuredX + 560 : featuredX,
        featuredY + (imgHeight - 500),
        500,
        500
      );

      // Gameplay Tags
      if (item.effects && item.effects.length) {
        try {
          if (item.effects[0].split(".").pop() == "BuiltInEmote") {
            ctx.drawImage(
              await loadImage(`./assets/gptags/BuiltInContentEF.png`),
              featuredX + (imgWidth - 100),
              featuredY + (imgHeight - 220),
              80,
              80
            );
          } else {
            ctx.drawImage(
              await loadImage(
                `./assets/gptags/${item.effects[0].split(".").pop()}EF.png`
              ),
              featuredX + (imgWidth - 100),
              featuredY + (imgHeight - 220),
              80,
              80
            );
          }
        } catch {
          console.log(
            `Could not load Gameplay Tag ${item.effects[0].split(".").pop()}`
              .red
          );
        }
      }

      // Return to the default height
      if (wasBelow === true) {
        featuredY = featuredY - 520;
      }

      // Rows
      featuredX = featuredX + imgWidth + 60;
      rendered = rendered + 1;
      if (rendered === items.length) {
        rendered = 0;
        featuredY = featuredY + 1200;
        featuredX = 150;
      }
    }
  }

  // Save image
  const buf = canvas.toBuffer("image/jpeg");

  fs.writeFileSync("assets/shop.jpg", buf);

  // Return path
  console.log(
    `Successfully rendered Item Shop image in ${
      (Date.now() - beforeFinish) / 1000
    }s`.green.bold
  );
  return buf;
}

/**
 * Get's the current shop items and formats them.
 */
async function getShopItems(apiKey, language) {
  const shop = {};

  const items = await axios
    .get(`https://fortniteapi.io/v2/shop?lang=${language}&renderData=true`, {
      headers: {
        Authorization: apiKey,
      },
    })
    .catch(console.error);

  const store = items.data.shop;

  if (!store) {
    throw new Error("Failed to fetch shop data");
  }

  store.forEach((el) => {
    if (!shop[el.section.id]) {
      shop[el.section.id] = {
        name: el.section.name,
        entries: [],
      };
    }
    shop[el.section.id].entries.push({
      name: el.displayName,
      description: el.displayDescription,
      id: el.mainId,
      type: el.displayType,
      mainType: el.mainType,
      offerId: el.offerId,
      giftAllowed: el.giftAllowed,
      price: el.price,
      rarity: el.rarity,
      series: el.series,
      images: {
        icon: el.displayAssets[0].url,
        background: el.displayAssets[0].background,
      },
      banner: el.banner,
      effects: el.granted[0].gameplayTags.filter((kek) =>
        kek.includes("UserFacingFlags")
      ),
      priority: el.priority,
      section: el.section,
      size: el.tileSize,
      renderData: el.displayAssets[0].renderData,
    });
  });

  return shop;
}
