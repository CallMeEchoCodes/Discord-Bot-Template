import { Collection, Message } from 'discord.js'
import type { Bot } from '../Client'
import type { Command } from '../Types/Command'
import type { Event } from '../Types/Event'

const CommandHandler: Event = {
  trigger: 'messageCreate',
  type: 'on',
  async run (Client: Bot, message: Message): Promise<void> {
    if (!message.content.startsWith(Client.config.prefix) || message.author.bot) return

    let args: any = message.content.slice(Client.config.prefix.length).split(/ +/)
    const commandName = args.shift().toLowerCase()

    const command: Command = Client.commands.get(commandName) || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    if (!command) return

    const usage = `\`${Client.config.prefix + command.usage}\``
    if (command.args && !args.length) { message.reply(`That command requires arguments! The correct usage is: ${usage}`); return }
    if (typeof command.args === 'number') { if (command.args && !args[command.args - 1]) { message.reply(`That command requires ${command.args} arguments! The correct usage is: ${usage}`); return } }
    if (command.args === 'full') args = message.content.slice(Client.config.prefix.length).slice(commandName.length)

    if (command.guildonly && message.guild === undefined) {
      await message.reply('That command can only be used in a guild!')
      return
    }

    if (!Client.cooldowns.has(command.name)) Client.cooldowns.set(command.name, new Collection())

    const now = Date.now()
    const timestamps = Client.cooldowns.get(command.name)
    let cooldownAmount: number = 0
    if (command.cooldown === undefined) { cooldownAmount = (3) * 1000 } else { cooldownAmount = command.cooldown * 1000 }

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        await message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        return
      }
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

    const Member = message.member // Required for the permissions check to work. This is caused by Interaction.member being ?GuildMember | ?APIGuildMember instead of ?GuildMember.
    if (command.permissions !== undefined) if (!Member.permissions.has(command.permissions)) { await message.reply('You don\'t have permission to use that command!'); return }
    if (command.permissions !== undefined) if (!(await Member.guild.members.fetch(Client.config.id)).permissions.has(command.permissions)) { await message.reply('I don\'t have permission to use that command!'); return }

    try {
      command.run(Client, message, args)
    } catch (err) {
      Client.logger.error(`Failed to run ${command.name} for user ${message.author.tag}.`, err)
      await message.reply('There was an error while executing that command! My developer has been notified.')
    }
  }
}

module.exports = CommandHandler
