---
title: Linux Shell中捕获CTRL+C
date: 2022-10-13 20:18:51
tags:
---
# Linux Shell中捕获CTRL+C

实例
```
#!/bin/bash

trap 'onCtrlC' INT
function onCtrlC () {
    echo 'Ctrl+C is captured'
}

while true; do
    echo 'I am working!'
     sleep 1
done
```
执行上述脚本，按下Ctrl+C按键将会触发onCtrlC函数
