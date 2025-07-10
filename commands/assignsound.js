const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assignsound')
    .setDescription('Permite a un admin asignar un sonido de salida personalizado a un usuario')
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario al que quieres asignar el sonido')
         .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('sound')
         .setDescription('Archivo de sonido .mp3')
         .setRequired(true)
    ),

  async execute(interaction) {
    // Solo admins pueden usar
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ No tienes permisos para usar este comando.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const attachment = interaction.options.getAttachment('sound');

    if (!attachment.name.endsWith('.mp3')) {
      return interaction.reply({ content: '❌ Solo se permiten archivos .mp3', ephemeral: true });
    }

    try {
      const res = await fetch(attachment.url);
      const buffer = await res.arrayBuffer();

      const filePath = path.join(__dirname, '..', 'sounds', `${user.id}.mp3`);
      await fs.writeFile(filePath, Buffer.from(buffer));

      interaction.reply({ content: `✅ Sonido de salida asignado correctamente a ${user.tag}.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: '❌ Error al guardar el archivo.', ephemeral: true });
    }
  }
};
