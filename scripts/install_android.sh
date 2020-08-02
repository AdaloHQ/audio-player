#!/bin/bash
set -e
set -x

dir=$(dirname "${0}")

sed -i.bak '/defaultConfig {/ a\
      multiDexEnabled true\
    ' android/app/build.gradle

$dir/background_control.sh