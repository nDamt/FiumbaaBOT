require('dotenv').config();
const { Client, GatewayIntentBits} = require('discord.js');

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})
client.once('ready', () => {
    console.log("Bot is online ${client.user.tag})");
});

cliente.login(process.env.TOKEN);