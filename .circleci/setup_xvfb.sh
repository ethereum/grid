#!/usr/bin/env bash

if [[ $CIRCLE_JOB == "linux" ]]; then
  apt-get update && apt-get install -y \
    software-properties-common \
    unzip \
    curl \
    xvfb

  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
fi
