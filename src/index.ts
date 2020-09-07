import { Command, flags } from '@oclif/command'
import * as execa from 'execa'
import * as fs from 'fs'
import { Package } from './interfaces'

const DEFAULTS = {
  PKG_LOCATION: './package.json',
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

  async run() {
    const { args, flags } = this.parse(Pushtag)

    const pkg = await this.readPackage()
    this.log(pkg.version)

    this.log('Done!!!')
  }
}

export = Pushtag
