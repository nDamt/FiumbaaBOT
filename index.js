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

//Registro de comandos a Discord asi que use la api rest 
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

//Ahora voy a hacer el escuchador de los comandos de interacción
client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if(commandName === 'play'){
        const query = interaction.options.getString('query');
        if(!interaction.member.voice.channel) {
            return interaction.reply('❌ Debes estar en un canal de voz >:()');
        }
        const queue = player.nodes.create(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });

        try{
            if(!queue.connection) await queue.connect(interaction.member.voice.channel);
            const searchResult = await player.search(query, { requestedBy: interaction.user });
            if(!searchResult.tracks.length) return interaction.reply('❌ No se encontraron resultados para tu búsqueda.');
            await queue.addTrack(searchResult.tracks[0]);
            if(!queue.playing) await queue.play();
            interaction.reply(`🎶 Reproduciendo: **${searchResult.tracks[0].title}**`);
        }catch(error){
            interaction.reply('⚠️ Error al reproducir la música.');
        }
    }
    
    // A partir de aqui hago las funciones de los comandos

    if (commandName === 'pause'){
        const queue = player.nodes.get(interaction.guild);
        if(!queue || !queue.playing) {
            return interaction.reply('❌ No hay música reproduciéndose');
        }
        queue.node.pause();
        interaction.reply('⏸️ Música pausada.');
    }
    if (commandName === 'resume'){
        const queue = player.nodes.get(interaction.guild);
        if(!queue || !queue.paused) {
            return interaction.reply('❌ No hay música pausada');
        }
        queue.node.resume();
        interaction.reply('▶️ Música reanudada.');
    }
    if (commandName === 'skip'){
        const queue = player.nodes.get(interaction.guild);
        if(!queue || !queue.playing){
            return interaction.reply('❌ No hay música reproduciéndose');
        }
        queue.node.skip();
        interaction.reply('⏭️ Música saltada.');
    }
    if (commandName === 'stop'){
        const queue = player.nodes.get(interaction.guild);
        if(!queue || !queue.playing){
            return interaction.reply('❌ No hay música reproduciéndose');
        }
        queue.delete();
        interaction.reply('🛑 Reproducción pausada');
    }
});


client.login(process.env.TOKEN);