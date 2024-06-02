import { join } from 'https://deno.land/std/path/mod.ts'
import { updateBackgroundControl } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string
const projectName = Deno.env.get('ADALO_APP_PROJECT_NAME') as string

const runPlutilCommand = async (projectName: string, args: string[]) => {
  const target = `ios/${projectName}/Info.plist`
  const td = new TextDecoder()
  const options = { args: [...args, target] }
  const proc = await new Deno.Command('plutil', options).output()

  const out = td.decode(proc.stdout).trim()
  const err = td.decode(proc.stderr).trim()

  console.log('stdout:  ', out)
  if (err) {
    console.error('stderr:  ', err)
  }

  if (!proc.success) {
    throw new Error(`plutil failed with exit code ${proc.code}`)
  }
}

Deno.chdir(projectPath)

const infoPlistPath = join(projectPath, `ios/${projectName}/Info.plist`)
const infoPlistContent = await Deno.readTextFile(infoPlistPath)

if (infoPlistContent.includes('<string>audio')) {
  console.log('Background audio already supported, nothing to do here.')
} else if (infoPlistContent.includes('UIBackgroundModes')) {
  console.log(
    `Adding 'audio' to existing UIBackgroundModes array in Info.Plist...`
  )
  await runPlutilCommand(projectName, [
    '-insert',
    'UIBackgroundModes.0',
    '-string',
    'audio',
  ])

  console.log(`Added 'audio' to existing UIBackgroundModes array in Info.Plist`)
} else {
  console.log(`Adding UIBackgroundModes with 'audio' to Info.plist...`)
  await runPlutilCommand(projectName, [
    '-insert',
    'UIBackgroundModes',
    '-xml',
    '<array><string>audio</string></array>',
  ])
  console.log(`Added UIBackgroundModes with 'audio' to Info.Plist`)
}

await updateBackgroundControl(projectPath)
console.log('Finished installing background audio support for iOS')
