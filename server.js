const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const webhook = new Webhook('https://discord.com/api/webhooks/1168196794451239083/hI9UHr7IrNFPXmdYgZDzkRJ8Ja2ZULdn3cSVPHgjSd5PSFdW8Mr_2Q0rbrRSkNqP2jv3');
const playersArray = [];
function sendPlayerToDiscord(player) {
    const message = new MessageBuilder()
        .setName('New Player Alert')
        .setTitle(`New Player: ${player.name}`)
        .addField('Overall', player.rating, true)
        .addField('Position', player.position, true)
        .setURL(player.href);

    webhook.send(message);
}
function checkAndSendNewPlayers(newPlayers) {
    for (const player of newPlayers) {
        const existingPlayer = playersArray.find(p => p.name === player.name);
        if (!existingPlayer) {
            sendPlayerToDiscord(player);
            playersArray.push(player);
        }
    }
}
async function crawlWebsite(url) {
    try {
        const newPlayers = [];
        const response = await axios.get(url);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            
            $('.latest-players-row a').each((index, element) => {
                const playerInfo = {
                    href: $(element).attr('href'),
                    name: $(element).find('.name').text(),
                    rating: $(element).find('.rating').text(),
                    position: $(element).find('.position').text(),
                };
                newPlayers.push(playerInfo);
            });
            checkAndSendNewPlayers(newPlayers);
        } else {
            console.error('Failed to fetch the page.');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

crawlWebsite('https://renderz.app'); 
setInterval(() => {
    crawlWebsite('https://renderz.app'); 
    console.log('crawl again');
}, 2 * 60 * 1000); // 2 minutes in milliseconds