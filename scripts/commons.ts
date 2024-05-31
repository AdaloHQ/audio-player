import { join } from 'https://deno.land/std/path/mod.ts'

export const backupFile = (filePath: string) =>
  Deno.copyFile(filePath, `${filePath}.bak`)

export const updateBackgroundControl = async (projectPath: string) => {
  console.log(`Updating TrackPlayer import in index.js`)
  const indexFilePath = join(projectPath, '/index.js')
  await backupFile(indexFilePath)

  let indexContent = await await Deno.readTextFile(indexFilePath)

  const importStatement =
    'import TrackPlayer from "react-native-track-player";\n'

  const registerComponentStatement = `
TrackPlayer.registerPlaybackService(() =>
require('./node_modules/@adalo/audio-player/src/components/AudioPlayer/service.js'),
);
`
  // Insert the import statement
  indexContent = indexContent.replace(
    /(import {name as appName})/g,
    `$1\n${importStatement}`
  )

  // Insert the register component statement
  indexContent = indexContent.replace(
    /(registerComponent)/g,
    `$1\n${registerComponentStatement}`
  )

  // Write the changes back to the file
  await Deno.writeTextFile(indexFilePath, indexContent)
  console.log(`Finished updating TrackPlayer import in index.js`)
}
