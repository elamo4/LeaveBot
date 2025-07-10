const fs = require('fs-extra');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const {
  joinVoiceChannel, createAudioPlayer,
  createAudioResource, entersState,
  VoiceConnectionStatus, AudioPlayerStatus
} = require('@discordjs/voice');
const { MessageFlags } = require('discord-api-types/v10'); // <-- Añadido

const TOKEN = 'MTM5Mjg4NTM4MDI4NTU5OTgxNA.GUCNxj.5AeMusJQStoKHyGjzu4dRJ1d141vs0qM6pz9Yk';
const CLIENT_ID = '1392885380285599814';
const GUILD_ID = '1392856692852785235';

const SOUNDS_DIR = path.join(__dirname, 'sounds');
fs.ensureDirSync(SOUNDS_DIR);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registrados correctamente.');
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    // ✅ Forma actualizada usando flags
    interaction.reply({
      content: '❌ Error al ejecutar comando.',
      flags: MessageFlags.Ephemeral
    });
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (oldState.channelId && !newState.channelId) {
    if (oldState.member.user.id === client.user.id) return;

    const userId = oldState.member.user.id;
    const filePath = path.join(SOUNDS_DIR, `${userId}.mp3`);
    const soundFile = fs.existsSync(filePath)
      ? filePath
      : path.join(SOUNDS_DIR, 'default.mp3');

    const channel = oldState.channel;
    if (!channel || channel.members.has(client.user.id)) return;

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 10000);

      const player = createAudioPlayer();

      player.on('error', error => {
        console.error('❌ Error en el reproductor de audio:', error);
        connection.destroy();
      });

      const resource = createAudioResource(soundFile);

      player.play(resource);
      connection.subscribe(player);

      await entersState(player, AudioPlayerStatus.Idle, 300000);
      connection.destroy();

    } catch (error) {
      console.error('❌ Error reproduciendo sonido:', error);
    }
  }
});

client.login(TOKEN);
