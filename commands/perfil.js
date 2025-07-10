const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Muestra información del bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Perfil del Bot')
      .setColor(0x00AEFF)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        { name: 'Creador', value: 'VonGaming5', inline: true },
        {
          name: 'Comandos disponibles',
          value: interaction.client.commands.map(cmd => `• \`/${cmd.data.name}\``).join('\n') || 'Ninguno'
        }
      )
      .setFooter({ text: 'Bot en funcionamiento 24/7 gracias a Railway' });

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
