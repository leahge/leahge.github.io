---
title: grep
date: 2024-01-23 12:26:06
tags:
---
# grep
Linux grep (global regular expression) 命令用于查找文件里符合条件的字符串或正则表达式。

grep 指令用于查找内容包含指定的范本样式的文件，如果发现某文件的内容符合所指定的范本样式，预设 grep 指令会把含有范本样式的那一列显示出来。若不指定任何文件名称，或是所给予的文件名为 **\-** ，则 grep 指令会从标准输入设备读取数据。

### **语法**

```text-plain
grep [options] pattern [files]
或
grep [-abcEFGhHilLnqrsvVwxy][-A<显示行数>][-B<显示列数>][-C<显示列数>][-d<进行动作>][-e<范本样式>][-f<范本文件>][--help][范本样式][文件或目录...]
```

*   pattern - 表示要查找的字符串或正则表达式。
*   files - 表示要查找的文件名，可以同时查找多个文件，如果省略 files 参数，则默认从标准输入中读取数据。

**常用选项：**：

*   `-i`：忽略大小写进行匹配。
*   `-v`：反向查找，只打印不匹配的行。
*   `-n`：显示匹配行的行号。
*   `-r`：递归查找子目录中的文件。
*   `-l`：只打印匹配的文件名。
*   `-c`：只打印匹配的行数。

**更多参数说明**：

*   **\-a 或 --text** : 不要忽略二进制的数据。
*   **\-A<显示行数> 或 --after-context=<显示行数>** : 除了显示符合范本样式的那一列之外，并显示该行之后的内容。
*   **\-b 或 --byte-offset** : 在显示符合样式的那一行之前，标示出该行第一个字符的编号。
*   **\-B<显示行数> 或 --before-context=<显示行数>** : 除了显示符合样式的那一行之外，并显示该行之前的内容。
*   **\-c 或 --count** : 计算符合样式的列数。
*   **\-C<显示行数> 或 --context=<显示行数>或-<显示行数>** : 除了显示符合样式的那一行之外，并显示该行之前后的内容。
*   **\-d <动作> 或 --directories=<动作>** : 当指定要查找的是目录而非文件时，必须使用这项参数，否则grep指令将回报信息并停止动作。
*   **\-e<范本样式> 或 --regexp=<范本样式>** : 指定字符串做为查找文件内容的样式。
*   **\-E 或 --extended-regexp** : 将样式为延伸的正则表达式来使用。
*   **\-f<规则文件> 或 --file=<规则文件>** : 指定规则文件，其内容含有一个或多个规则样式，让grep查找符合规则条件的文件内容，格式为每行一个规则样式。
*   **\-F 或 --fixed-regexp** : 将样式视为固定字符串的列表。
*   **\-G 或 --basic-regexp** : 将样式视为普通的表示法来使用。
*   **\-h 或 --no-filename** : 在显示符合样式的那一行之前，不标示该行所属的文件名称。
*   **\-H 或 --with-filename** : 在显示符合样式的那一行之前，表示该行所属的文件名称。
*   **\-i 或 --ignore-case** : 忽略字符大小写的差别。
*   **\-l 或 --file-with-matches** : 列出文件内容符合指定的样式的文件名称。
*   **\-L 或 --files-without-match** : 列出文件内容不符合指定的样式的文件名称。
*   **\-n 或 --line-number** : 在显示符合样式的那一行之前，标示出该行的列数编号。
*   **\-o 或 --only-matching** : 只显示匹配PATTERN 部分。
*   **\-q 或 --quiet或--silent** : 不显示任何信息。
*   **\-r 或 --recursive** : 此参数的效果和指定"-d recurse"参数相同。
*   **\-s 或 --no-messages** : 不显示错误信息。
*   **\-v 或 --invert-match** : 显示不包含匹配文本的所有行。
*   **\-V 或 --version** : 显示版本信息。
*   **\-w 或 --word-regexp** : 只显示全字符合的列。
*   **\-x --line-regexp** : 只显示全列符合的列。
*   **\-y** : 此参数的效果和指定"-i"参数相同。

\-P --perfl-regexp  PATTERN 是一个Perl\_正则表达式\_

例子：在当前目录里第一级文件夹中寻找包含指定字符串的 .in 文件

```text-plain
grep "thermcontact" /.in
```

**1、或操作**

```text-plain
grep -E '123|abc' filename  // 找出文件（filename）中包含123或者包含abc的行
egrep '123|abc' filename    // 用egrep同样可以实现
awk '/123|abc/' filename   // awk 的实现方式
```

**2、与操作**

```text-plain
grep pattern1 files | grep pattern2 //显示既匹配 pattern1 又匹配 pattern2 的行。
```

**3、其他操作**

```text-plain
grep -i pattern files   //不区分大小写地搜索。默认情况区分大小写，
grep -l pattern files   //只列出匹配的文件名，
grep -L pattern files   //列出不匹配的文件名，
grep -w pattern files  //只匹配整个单词，而不是字符串的一部分（如匹配‘magic’，而不是‘magical’），
grep -C number pattern files //匹配的上下文分别显示[number]行，
```