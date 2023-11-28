import cp from 'node:child_process'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'

const exec = promisify(cp.exec)

export async function createGitter(src: string, dest: string) {
  async function git(command: string) {
    console.log(`Running "git ${command}"...`)

    const result = await exec(`git ${command}`, {
      cwd: dest,
    })

    if (result.stderr) {
      return console.error(`"git ${command}" ended in error: ${result.stderr}`)
    }

    return result.stdout
  }

  if (!existsSync(dest)) {
    console.log(`Cloning git repo now, this will take a few minutes...`)

    await git(`clone --depth=1 --no-checkout ${src}`)
  }

  return git
}
