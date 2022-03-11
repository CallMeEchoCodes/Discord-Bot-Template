import { MessageEmbed } from 'discord.js'
import type { CommandInteraction } from 'discord.js'
import type { Command } from '../../Types/Command'
import type { Bot } from '../../Client'

const Ping: Command = {
  name: 'ping',
  aliases: ['pong'],
  description: 'Ping!',
  usage: 'ping',
  category: 'Utils',

  async run (Client: Bot, Interaction: CommandInteraction): Promise<void> {
    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Pong!')
      .setDescription(`The bots ping is ${Client.ws.ping}ms.`)
    await Interaction.reply({ embeds: [embed] })
  }
}

module.exports = Ping
