const axios = require('axios');
const cheerio = require('cheerio');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MESSAGE_DELAY = 2000; // Delay in milliseconds (5 seconds)

// Initialize a Discord webhook
const webhook = new Webhook('https://discord.com/api/webhooks/1168217918975258796/WxyEeGfEc7FCmJg3pInJ2je_Kc5AVw4ZKqdBcTiy21Wl__ffkMVaxR0iMtHVPwiiCyNI');

// Initialize an array to store player data
const playersArray = [];

// Function to send a player to Discord
function sendPlayerToDiscord(player) {
    const message = new MessageBuilder()
        .setTitle(`${player.name}`)
        .addField('Overall', player.rating, true)
        .addField('Position', player.position, true)
        .setThumbnail(player.club)
        .setFooter(`player nation`, player.nation)
        .setURL(`https://renderz.app${player.href}`)
        .setImage(player.face)

    webhook.send(message);
}

// Function to check if a player is new and send them to Discord
async function checkAndSendNewPlayers(newPlayers) {
    for (const player of newPlayers) {
        const existingPlayer = playersArray.find(p => p.name === player.name && p.rating === player.rating);
        if (!existingPlayer) {
            sendPlayerToDiscord(player);
            playersArray.push(player);
            webhook.send('@everyone')
            await delay(MESSAGE_DELAY);
        }
    }
}

// Function to crawl and refresh player data
async function crawlAndRefreshData() {
    try {
        const response = await axios.get('https://renderz.app');
        const $ = cheerio.load(response.data);

        // Perform the data crawl as shown in previous responses
        // ...

        // Extract new player data
        const newPlayers = [];
        $('.latest-players-row a').each((index, element) => {
            const playerInfo = {
                href: $(element).attr('href'),
                name: $(element).find('.name').text(),
                rating: $(element).find('.rating').text(),
                position: $(element).find('.position').text(),
                face: $(element).find('.action-shot').attr('src'),
                club: $(element).find('.club').attr('src'),
                nation: $(element).find('.nation').attr('src'),
            };
            newPlayers.push(playerInfo);
        });

        // Check and send new players to Discord
        checkAndSendNewPlayers(newPlayers);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Execute the initial data crawl
crawlAndRefreshData();

// Schedule data crawl and refresh every 2 minutes
setInterval(() => {
    crawlAndRefreshData();
    const i = 0;
    console.log(`${i}. check again`);
}, 1 * 60 * 1000); // 1 minutes in milliseconds
