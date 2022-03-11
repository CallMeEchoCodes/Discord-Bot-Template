import { Client, Collection, Intents } from 'discord.js'
import { Logger } from 'tslog'
import { readdirSync } from 'fs'
import configFile from './config.json'
import type { ClientOptions } from 'discord.js'
import type { Command } from './Types/Command'
import type { Event } from './Types/Event'

export class Bot extends Client {
  config: {
    token: string
    prefix: string
    owner: string
    id: string
  }

  logger: Logger
  commands: Collection<unknown, Command>
  cooldowns: Collection<unknown, Collection<unknown, number>>

  constructor () {
    const props: ClientOptions = {
      presence: { activities: [{ name: 'Eider Canary - Typescript Update!' }] },
      partials: ['CHANNEL'],
      intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS]
    }

    super(props)

    this.logger = new Logger()
    this.config = configFile

    this.commands = new Collection()
    this.cooldowns = new Collection()
  }

  public Login (): void {
    if (this.config.token === '' || this.config.token === null) {
      this.logger.fatal('The Token You Provided Was Invalid!')
      process.exit(1)
    }
    try {
      super.login(this.config.token)
    } catch (error) {
      this.logger.fatal('The Token You Provided Was Invalid!')
      process.exit(1)
    }
  }

  public async loadEvents (path: string): Promise<void> {
    this.logger.info('Loading Events...')
    const EventFiles: string[] = readdirSync(`${path}`).filter(file => file.endsWith('.js'))
    for (const EventFile of EventFiles) {
      const Event: Event = await import(`${path}/${EventFile}`) as unknown as Event
      if (Event.type === 'once') super.once(Event.trigger, (...args) => Event.run(this, ...args))
      else super.on(Event.trigger, (...args) => Event.run(this, ...args))
      this.logger.info(`Loaded ${EventFile} - ${Event.trigger} Event`)
    }
  }

  public async loadCommands (path: string): Promise<void> {
    this.logger.info('Loading Commands...')
    const commandFolders = readdirSync(path)
    for (const folder of commandFolders) {
      if (folder.endsWith('.js')) {
        this.logger.warn(`Command ${folder} is not in a subdirectory! It has been ignored, please move it.`)
        continue
      }
      if (folder.endsWith('.map')) continue
      const commandFiles = readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'))
      for (const file of commandFiles) {
        const command = await import(`${path}/${folder}/${file}`) as unknown as Command

        this.commands.set(command.name, command)
        this.logger.info(`Loaded ${file} - ${command.name} Command`)
      }
    }
  }
}
