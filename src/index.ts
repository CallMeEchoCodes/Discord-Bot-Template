import { Bot } from './Client'

const Client = new Bot()

Client.loadEvents('./Events')
Client.loadCommands('./Commands')

Client.Login()
