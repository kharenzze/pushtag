import { Command, flags } from '@oclif/command'
import * as execa from 'execa'
import * as fs from 'fs'
import { Package } from './interfaces'
const inquirer = require('inquirer')

const DEFAULTS = {
  PKG_LOCATION: './package.json',
  PREFIX: 'v',
}

class Pushtag extends Command {
  static description = 'Push git tag based on package.json version'

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'file' }]

  private readPackage = async () => {
    const pkgString = await fs.promises.readFile(DEFAULTS.PKG_LOCATION, {
      encoding: 'utf8',
    })
    const pkg: Package = JSON.parse(pkgString)
    return pkg
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
    const { args, flags } = this.parse(Pushtag)

    const pkg = await this.readPackage()

    await this.checkGitStatus()

    this.log('Done!!!')
  }
}

export = Pushtag
