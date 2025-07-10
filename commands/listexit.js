const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listexit')
    .setDescription('Muestra los usuarios con sonidos personalizados (solo admins)'),

  async execute(interaction) {
    if (!interaction.memberPermissions.has('Administrator')) {
      return interaction.reply({ content: '🚫 No tienes permisos para esto.', ephemeral: true });
    }

    const soundsDir = path.join(__dirname, '..', 'sounds');
    const files = await fs.readdir(soundsDir);
    const userIds = files
      .filter(f => f.endsWith('.mp3') && f !== 'default.mp3')
      .map(f => `<@${f.replace('.mp3', '')}>`);

    const content = userIds.length > 0
      ? `👥 Usuarios con sonidos personalizados:\n${userIds.join('\n')}`
      : '📭 No hay sonidos personalizados.';

    interaction.reply({ content, ephemeral: true });
  }
};
