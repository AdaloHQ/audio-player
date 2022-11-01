#!/bin/bash
set -e
set -x

dir=$(dirname "${0}")

sed -i.bak 'com.android.tools.build:gradle:3.5.4/com.android.tools.build:gradle:4.2.2' android/build.gradle

sed -i.bak '/defaultConfig {/ a\
      multiDexEnabled true\
    ' android/app/build.gradle

$dir/background_control.sh