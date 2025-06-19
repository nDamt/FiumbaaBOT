require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder} = require('discord.js');
const { Player } = require('discord-player');

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
})

const player = new Player(client);

client.once('ready', () => {
    console.log(`Bot is online ${client.user.tag}`);
    registerCommands();
});

//CREO LOS SLASH PARA PODER HACER USO DE LOS COMMANDOS
const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproducir música')
        .addStringOption(option => 
            option.setName('query').setDescription('Capo dame el nombre o link de la canción').setRequired(true)),
    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausar la música'),
    new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reanudar la música'),
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Saltar la música actual'),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detener la música')
].map(command => command.toJSON());    // Esto sirve para convertir los comandos a JSON vale :)

async function registerCommands(){
    const rest = new REST({ version: '10'}).setToken(process.env.TOKEN);
    try{
        console.log('🔄 Registrando Slash Commands . . . .')
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        ),
        console.log('✅ Slash Commands registrados ;)');
    }catch (error){
        console.error('❌ Error al registrar los comandos:', error);
    }
}

client.login(process.env.TOKEN);