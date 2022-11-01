#!/bin/bash
set -e
set -x

dir=$(dirname "${0}")

sed -i.bak '/com.android.tools.build:gradle/a\
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.30"
' android/build.gradle

sed -i.bak '' '$a\ org.gradle.jvm.version=11' android/build.gradle
sed -i.bak '' '$a\ org.gradle.libraryelements="jar"' android/build.gradle

sed -i.bak '/defaultConfig {/ a\
      multiDexEnabled true\
    ' android/app/build.gradle

$dir/background_control.sh