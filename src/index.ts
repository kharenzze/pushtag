import { Command, flags } from '@oclif/command'
import * as execa from 'execa'
import * as fs from 'fs'

const defPackageLocation = './package.json'

class Pushtag extends Command {
  static description = 'Push git tag based on package.json version'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'file' }]

  private readPackage = async () => {
    return await fs.promises.readFile(defPackageLocation)
  }

  async run() {
    const { args, flags } = this.parse(Pushtag)

    const pkg = this.readPackage()

    this.log('Done!!!')
  }
}

export = Pushtag
