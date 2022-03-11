import axios from 'axios'
import Vibrant from 'node-vibrant'
import { Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import type { ColorResolvable } from 'discord.js'
import type { Command } from '../../Types/Command'
import type { Bot } from '../../Client'

const Tweak: Command = {
  name: 'tweak',
  aliases: ['tweaks', 'jailbreak'],
  description: 'Search For A Jailbreak Tweak.',
  usage: 'tweak [tweak]',
  category: 'Utils',

  async run (Client: Bot, message: Message, args: any[]): Promise<void> {
    type CanisterResponse = {
      status: string
      date: string
      data: Array<{ identifier: string
        name: string
        description: string
        packageIcon: string
        author: string
        latestVersion: string
        depiction: string
        section: string
        price: string
        repository: {uri: string
          name: string}
      }>
    }

    let author = 'null'
    const { data } = await axios.get(`https://api.canister.me/v1/community/packages/search?query=${args[0]}&searchFields=identifier,name,author,maintainer&responseFields=identifier,name,description,packageIcon,repository.uri,repository.name,author,latestVersion,depiction,section,price`)
    const res = data as CanisterResponse

    try { if (res.data[0].name === undefined || res.data[0].name === null) { await message.reply('Your search returned no results!'); return } } catch { await message.reply('Something went wrong. Try again'); return }
    if (res.data[0].author === null || res.data[0].author === undefined) { author = 'Unknown' } else { author = res.data[0].author }

    let color = null

    if (res.data[0].packageIcon !== null || undefined) {
      console.log(res.data[0].packageIcon)
      if (res.data[0].packageIcon.startsWith('http:') || res.data[0].packageIcon.startsWith('https:')) {
        color = await Vibrant.from(res.data[0].packageIcon || 'https://repo.packix.com/api/Packages/60bfb71987ca62001c6585e6/icon/download?size=medium&hash=2').getPalette()
        color = color.Vibrant.hex
      } else {
        color = '#fccc04'
        res.data[0].packageIcon = undefined
      }
    } else {
      color = '#fccc04'
      res.data[0].packageIcon = undefined
    }

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setStyle('LINK')
          .setURL(res.data[0].depiction || 'https://404.github.io/')
          .setEmoji('🔍')
          .setLabel('View Depiction'),
        new MessageButton()
          .setEmoji('931391570320715887')
          .setStyle('LINK')
          .setURL(`https://sharerepo.stkc.win/v2/?pkgman=cydia&repo=${res.data[0].repository.uri}`)
          .setLabel('Add Repo To Cydia'),
        new MessageButton()
          .setEmoji('931390952411660358')
          .setStyle('LINK')
          .setURL(`https://sharerepo.stkc.win/v2/?pkgman=sileo&repo=${res.data[0].repository.uri}`)
          .setLabel('Add Repo To Sileo'),
        new MessageButton()
          .setEmoji('931391570639478834')
          .setStyle('LINK')
          .setURL(`https://sharerepo.stkc.win/v2/?pkgman=zebra&repo=${res.data[0].repository.uri}`)
          .setLabel('Add Repo To Zebra'),
        new MessageButton()
          .setEmoji('931391570404573235')
          .setStyle('LINK')
          .setURL(`https://sharerepo.stkc.win/v2/?pkgman=installer&repo=${res.data[0].repository.uri}`)
          .setLabel('Add Repo To Installer')

      )

    const embed = new MessageEmbed()
      .setColor(color as ColorResolvable)
      .setTitle(res.data[0].name)
      .setThumbnail(res.data[0].packageIcon || 'https://repo.packix.com/api/Packages/60bfb71987ca62001c6585e6/icon/download?size=medium&hash=2')
      .setDescription(res.data[0].description)
      .addField('Author', author, true)
      .addField('Version', res.data[0].latestVersion, true)
      .addField('Price', res.data[0].price, true)
      .addField('Repo', `[${res.data[0].repository.name}](${res.data[0].repository.uri})`, true)
      .addField('Bundle ID', res.data[0].identifier, true)
      .setFooter({ text: 'Powered by Canister', iconURL: 'https://canister.me/canister.svg' })
    await message.reply({ embeds: [embed], components: [row] })
  }
}

module.exports = Tweak
