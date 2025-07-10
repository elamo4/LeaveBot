const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setexit')
    .setDescription('Establece tu sonido de salida personalizado')
    .addAttachmentOption(opt =>
      opt.setName('sound')
        .setDescription('Archivo de sonido .mp3')
        .setRequired(true)
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('sound');
    if (!attachment.name.endsWith('.mp3')) {
      return interaction.reply({ content: '❌ Solo se permiten archivos .mp3', ephemeral: true });
    }

    const res = await fetch(attachment.url);
    const buffer = await res.arrayBuffer();

    const filePath = path.join(__dirname, '..', 'sounds', `${interaction.user.id}.mp3`);
    await fs.writeFile(filePath, Buffer.from(buffer));

    interaction.reply({ content: '✅ Sonido de salida guardado con éxito.', ephemeral: true });
  }
};
