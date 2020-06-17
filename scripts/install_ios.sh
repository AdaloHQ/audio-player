#!/bin/bash
set -e
set -x

sed -i.bak 's/9.0/10.0/' ios/Podfile
