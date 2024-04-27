#!/bin/bash

# !! Make sure if you use this script to change the path to your own vault !!
clear && npm run build && mv ./dist/* ~/notes/test-timelines/.obsidian/plugins/obsidian-timelines-v2/
