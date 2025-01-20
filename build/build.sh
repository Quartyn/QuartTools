#!/bin/bash

action=$1
browser=$2

echo "$action for $browser has been launched"

if [ $action = "set" ]; then
    echo "IS SET"
    if [ "$browser" != "firefox" ] && [ "$browser" != "chrome" ]; then
        echo '
Available options

    (0) Firefox (The best browser)
    (1) Chromium-based (Chrome, Opera, Brave)
        '
        option=input
        exit;
    else
        echo "HI"
    fi
fi