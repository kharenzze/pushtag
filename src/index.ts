import { Command, flags } from '@oclif/command'
import * as execa from 'execa'
import * as fs from 'fs'
import { Package } from './interfaces'

const inquirer = require('inquirer')

const DEFAULTS = {
  PKG_LOCATION: './package.json',
  PREFIX: 'v',
  ORIGIN: 'origin',
}

class Pushtag extends Command {
  static description = 'Push git tag based on package.json version'

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    prefix: flags.string({
      char: 'p',
      description: 'Prefix that prepends the version number',
      default: DEFAULTS.PREFIX,
    }),
    origin: flags.string({
      char: 'o',
      description: 'Git remote name',
      default: DEFAULTS.ORIGIN,
    }),
  }

  static args = [{ name: 'file' }]

  private readPackage = async () => {
    const pkgString = await fs.promises.readFile(DEFAULTS.PKG_LOCATION, {
      encoding: 'utf8',
    })
    const pkg: Package = JSON.parse(pkgString)
    return pkg
  }

  private getTagName = async () => {
    const { flags } = this.parse(Pushtag)
    const { prefix } = flags
    const pkg = await this.readPackage()
    return prefix + pkg.version
  }

  private checkGitStatus: () => Promise<boolean> = async () => {
    const { stdout: status } = await execa.command('git status')
    const clear = status.includes('nothing to commit')
    if (!clear) {
      this.log('There are pending changes...')
      const { proceed } = await inquirer.prompt([
        {
          name: 'proceed',
          message: 'Do you want to continue?',
          type: 'confirm',
          default: false,
        },
      ])
      if (!proceed) {
        throw new Error('There are pending changes')
      }
    }
    return clear
  }

  async run() {
    const { flags } = this.parse(Pushtag)
    const { origin } = flags
    await this.checkGitStatus()
    const tagName = await this.getTagName()
    this.log(`You are going to apply and push this tag: ${tagName}`)
    const { proceed } = await inquirer.prompt([
      {
        name: 'proceed',
        message: 'Do you want to continue?',
        type: 'confirm',
        default: true,
      },
    ])
    if (!proceed) {
      this.log(`Aborting`)
      return 0
    }
    await execa.command(`git tag ${tagName}`)
    await execa.command(`git push ${origin} ${tagName}`)
    this.log('Done!!!')
  }
}

export = Pushtag
