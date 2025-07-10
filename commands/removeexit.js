const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeexit')
    .setDescription('Elimina tu sonido de salida personalizado'),

  async execute(interaction) {
    const filePath = path.join(__dirname, '..', 'sounds', `${interaction.user.id}.mp3`);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      interaction.reply({ content: '🗑️ Sonido personalizado eliminado.', ephemeral: true });
    } else {
      interaction.reply({ content: '❌ No tienes un sonido personalizado.', ephemeral: true });
    }
  }
};
