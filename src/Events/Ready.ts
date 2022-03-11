import type { Bot } from '../Client'
import type { Event } from '../Types/Event'

const Ready: Event = {
  trigger: 'ready',
  type: 'once',
  run (Client: Bot): void {
    Client.logger.info(`Logged In As ${Client.user.tag} 🚀!`)
  }
}

module.exports = Ready
