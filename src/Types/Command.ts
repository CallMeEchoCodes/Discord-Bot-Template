import { PermissionResolvable } from 'discord.js'

export interface Command {
  name: string
  aliases: string[]
  description: string
  usage: string
  category: string
  ownerOnly?: boolean
  guildonly?: boolean
  permissions?: PermissionResolvable[] | PermissionResolvable
  cooldown?: number
  args?: number | 'full'
  run: Function
}
