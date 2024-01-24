---
title: last
date: 2024-01-23 12:24:25
tags:
---
# last
inux last 命令用于显示用户最近登录信息。

单独执行 **last** 指令，它会读取位于 /var/log/目录下，名称为 wtmp 的文件，并把该文件记录登录的用户名，全部显示出来。

### **语法**

```text-plain
last [options] [username...] [tty...]
```

**参数说明**：

options:

*   \-R 省略主机名 hostname 的列
*   \-a 　把从何处登入系统的主机名称或IP地址显示在最后一行。
*   \-d 　将IP地址转换成主机名称。
*   \-f<记录文件> 　指定记录文件。
*   \-n<显示行数>或-<显示行数> 　显示名单的行数。
*   \-R 　不显示登入系统的主机名称或IP地址。
*   \-x 　显示系统关机，重新开机，以及执行等级的改变等信息。

username:

*   username： 显示指定用户 username 的登录信息。

tty:

*   tty 设置登录的终端，tty 的名称可以缩写， **last 0** 与 **last tty0** 相同。

### **实例**

显示两行，并省略主机名 hostname 的列：

```text-plain
# last -R -2
root     pts/0        Thu Apr 28 18:06   still logged in
root     pts/0        Tue Apr 26 09:06 - 19:36  (10:30)

wtmp begins Sun Apr  3 13:11:25 2022
```

显示两行，并省略主机列：

```text-plain
~# last -R -2
root     pts/0        Thu Apr 28 18:06   still logged in
root     pts/0        Tue Apr 26 09:06 - 19:36  (10:30)

wtmp begins Sun Apr  3 13:11:25 2022
```

一般显示方法：

```text-plain
# last
...
root   pts/4    Thu May 13 17:25  still logged in  
root   pts/2    Thu May 13 17:23 - 17:25 (00:02)  
root   pts/1    Thu May 13 16:46  still logged in  
...
```

简略显示，并指定显示的个数:

```text-plain
# last -n 5 -R
root   pts/4    Thu May 13 17:25  still logged in  
root   pts/2    Thu May 13 17:23 - 17:25 (00:02)  
root   pts/1    Thu May 13 16:46  still logged in  
root   pts/7    Thu May 13 15:36  still logged in  
root   pts/9    Thu May 13 15:35  still logged in  

wtmp begins Thu May 13 18:55:40 2014
```

显示最后一列显示主机 IP 地址:

```text-plain
# last -n 5 -a -i
root   pts/4    Thu May 13 17:25  still logged in  192.168.1.10
root   pts/2    Thu May 13 17:23 - 17:25 (00:02)   192.168.1.10
root   pts/1    Thu May 13 16:46  still logged in  192.168.1.10
root   pts/7    Thu May 13 15:36  still logged in  192.168.1.10
root   pts/9    Thu May 13 15:35  still logged in  192.168.1.10

wtmp begins Thu May 13 18:55:40 2014
```