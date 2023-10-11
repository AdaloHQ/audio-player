#!/bin/bash
set -e
set -x

project_path=$(pwd)

sed -i.bak "/import {name as appName}/a\\
import TrackPlayer from \"react-native-track-player\";" index.js

sed -i.bak "/registerComponent/a\\
TrackPlayer.registerPlaybackService(() =>\
  require('./node_modules/@adalo/audio-player/src/components/AudioPlayer/service.js'),\
);
" index.js