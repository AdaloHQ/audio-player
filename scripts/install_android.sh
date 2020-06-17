#!/bin/bash
set -e
set -xx

sed -i.bak '/defaultConfig {/ a\
      multiDexEnabled true\
    ' android/app/build.gradle

sed -i.bak 's/5.5/6.3/' android/gradle/wrapper/gradle-wrapper.properties
