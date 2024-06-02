import { join } from 'https://deno.land/std/path/mod.ts'

export const backupFile = (filePath: string) =>
  Deno.copyFile(filePath, `${filePath}.bak`)

const insertLineAfterString = (
  multiLineText: string,
  searchString: string,
  lineToInsert: string
): string => {
  const lines = multiLineText.split('\n')

  let insertIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      insertIndex = i
      break
    }
  }

  if (insertIndex !== -1) {
    lines.splice(insertIndex + 1, 0, lineToInsert)
  }

  return lines.join('\n')
}

export const updateBackgroundControl = async (projectPath: string) => {
  console.log(`Updating TrackPlayer import in index.js`)
  const indexFilePath = join(projectPath, '/index.js')
  await backupFile(indexFilePath)

  let indexContent = await await Deno.readTextFile(indexFilePath)

  const importStatement = 'import TrackPlayer from "react-native-track-player"'
  const registerComponentStatement = `TrackPlayer.registerPlaybackService(() => require('./node_modules/@adalo/audio-player/src/components/AudioPlayer/service.js'),)`

  // Insert the import statement
  indexContent = insertLineAfterString(
    indexContent,
    'import {name as appName}',
    importStatement
  )

  // Insert the register component statement
  indexContent = insertLineAfterString(
    indexContent,
    'registerComponent',
    registerComponentStatement
  )

  // Write the changes back to the file
  await Deno.writeTextFile(indexFilePath, indexContent)
  console.log(`Finished updating TrackPlayer import in index.js`)
}
