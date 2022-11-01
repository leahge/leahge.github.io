---
title: Linux 中使用 pushd 和 popd 命令来进行高效的目录导航
date: 2022-10-13 20:18:51
tags:
---
# 在 Linux 中使用 pushd 和 popd 命令来进行高效的目录导航

有时候，通过命令来在 Linux 文件系统导航是一件非常痛苦的事情，特别是对于一些新手。通常情况下，我们主要使用 [cd（改变目录）命令](https://www.tecmint.com/cd-command-in-linux/)在 Linux 文件系统之间移动。

在之前的文章中，我们回顾了一个非常简单但很有用的 Linux 上的 CLI 工具，文章叫做 [bd：快速返回某级父目录而不用冗余地输入 “cd ../../..”](https://linux.cn/article-8491-1.html)

在这个教程中，我们将讨论两个相关的命令：`pushd` 和 `popd` ，使用它们可以高效的浏览 Linux 目录结构。这两个命令在大多数 shell ，比如 bash、tcsh 中都存在。

**推荐阅读：**[Autojump：快速浏览 Linux 文件系统的一个高级 `cd` 命令](https://linux.cn/article-5983-1.html)

### pushd 和 popd 命令在 Linux 系统中如何工作

`pushd` 和 `popd` 命令根据 ‘LIFO’（后进先出）原则工作。在这个原则之下，只有两个操作是允许的：把一个目录压入栈，以及把一个目录弹出栈。

`pushd` 命令会增加一个目录到栈顶，而 `popd` 命令会从栈顶移除一个目录。

为了显示目录栈中（或历史）的目录，我们可以使用下面展示的 `dirs` 命令：

```
$ dirs或$ dirs -v
```

<img src="./151608a7o7ofmiyii77it7.png">

*`dirs` - 显示位于目录栈中的目录*

`pushd` 命令：将一个目录路径添加到／放入目录栈（历史）中，之后，你可以浏览位于目录栈（历史）中的任意目录。当把一个新的目录入栈时，会打印出当前位于栈中的所有目录。

下面这些命令会展示这个命令是如何工作的：

```
$ pushd  /var/www/html/$ pushd ~/Documents/$ pushd ~/Desktop/$ pushd /var/log/
```

<img src="./151609lubuzhh8dhd48sf1.png">

*`pushd` - 添加新目录入栈*

根据上面输出的目录栈可知（目录索引按倒序排列）：

- `/var/log` 是目录栈中的第五个目录，索引为 0
- `~/Desktop/` 是第四个，索引为 1
- `~/Document/` 是第三个，索引为 2
- `/var/www/html` 是第二个，索引为 3
- `~` 是第一个，索引为 4

另外，我们也可以使用目录索引的形式 `pushd +#` 或 `pushd -#` 来添加目录入栈。为了进入目录 `~/Documents` ，我们可以输入：

```
$ pushd +2
```

<img src="./151609dgghr6jj9wf7jwt2.png">

*`pushd` －通过数字浏览目录*

注意，经过上一步操作以后，栈的内容便发生了改变。所以，要从上面的例子中进入目录 `/var/www/html` ，我们应该使用下面的命令：

```
$ pushd +1
```

<img src="./151609h3c8nsfo6rgyrtwo.png">

*`pushd` －通过数字浏览目录*

`popd` 命令－从栈顶或历史中移除一个目录。为了列出目录栈中的所有目录，只需输入：

```
$ popd
```

为了从目录栈中移除一个目录，我们可以使用 `popd +#` 或 `popd -#` 命令，在这时，我们需要输入下面的命令来移除目录 `~/Documents` ：

```
$ popd +1
```

<img src="./151610o6fhfm7kde47dzl4.png">

*`popd`－从栈中以移除目录*

在这篇文章中，我们阐述了 `pushd` 和 `popd` 命令，使用它们可以高效的访问目录结构。你可以通过下面的反馈表和我们分享你关于这篇文章的想法。
