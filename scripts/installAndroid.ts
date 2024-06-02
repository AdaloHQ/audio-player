import { join } from 'https://deno.land/std/path/mod.ts'
import { backupFile, updateBackgroundControl } from './commons.ts'

const projectPath = Deno.env.get('ADALO_APP_PROJECT_PATH') as string
const gradleFilePath = join(projectPath, 'android/app/build.gradle')
const gradleFileContent = await Deno.readTextFile(gradleFilePath)

if (!gradleFileContent.includes('multiDexEnabled true')) {
  await backupFile(gradleFilePath)

  // Insert multiDexEnabled true after defaultConfig {
  const modifiedGradleFileContent = gradleFileContent.replace(
    /(defaultConfig\s*{)/,
    `$1\n    multiDexEnabled true`
  )

  await Deno.writeTextFile(gradleFilePath, modifiedGradleFileContent)
  console.log(`Added "multiDexEnabled true" to android build.gradle file`)
} else {
  console.log(
    `"multiDexEnabled true" already exists in android build.gradle file`
  )
}

await updateBackgroundControl(projectPath)
