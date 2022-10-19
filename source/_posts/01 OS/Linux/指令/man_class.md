---
title: linux指令后的数字代表什么
date: 2022-10-13 20:18:51
tags:
---
小括号里的数字，就是一个man的分类号

Sections of the manual pages

      The manual Sections are traditionally defined as follows:       

1 User commands (Programs)

             Commands that can be executed by the user from within a shell.       

2 System calls

             Functions which wrap operations performed by the kernel.      

 3 Library calls

             All library functions excluding the system call wrappers (Most of the libc functions).       

4 Special files (devices)

             Files found in /dev which allow to access to devices through the kernel.       

5 File formats and configuration files

             Describes various human-readable file formats and configuration files.       

6 Games

             Games and funny little programs available on the system.       

7 Overview, conventions, and miscellaneous

             Overviews or descriptions of various topics, conventions, and protocols, character set standards, the standard filesystem layout, and miscellaneous other things.       

8 System management commands

             Commands like mount(8), many of which only root can  execute.   

1是普通的命令

2是系统调用,如open,write之类的

3是库函数,如printf,fread

4是特殊文件,也就是/dev下的各种设备文件

5是指文件的格式,比如passwd, 就会说明这个文件中各个字段的含义

6是给游戏留的,由各个游戏自己定义

7是附件还有一些变量,比如向environ这种全局变量在这里就有说明

8是系统管理用的命令,这些命令只能由root使用,如ifconfig
