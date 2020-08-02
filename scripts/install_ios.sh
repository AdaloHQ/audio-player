#!/bin/bash
set -e
set -x

sed -i.bak 's/9.0/10.0/' ios/Podfile

name=$PROJECT_NAME
dir=$(dirname "${0}")

if grep -q "<string>audio" ios/$name/Info.plist; then
    echo "Background audio already supported, nothing to do here."
elif grep -q UIBackgroundModes ios/$name/Info.plist
then
    plutil -insert UIBackgroundModes.0 -string 'audio' ios/$name/Info.plist
else
    plutil -insert UIBackgroundModes -xml "<array><string>audio</string></array>" ios/$name/Info.plist
fi

$dir/background_control.sh