---
title: sed
date: 2022-10-14 17:17:19
---
# sed 字符串替换
1. sed替换的基本语法为:
```
sed 's/原字符串/替换字符串/'
```
单引号里面,s表示替换,三根斜线中间是替换的样式,特殊字符需要使用反斜线”\”进行转义。

2. 单引号” ‘ ’”是没有办法用反斜线”\”转义的,这时候只要把命令中的单引号改为双引号就行了,格式如下：
```
# 要处理的字符包含单引号
sed "s/原字符串包含'/替换字符串包含'/"
```
3. 命令中的三根斜线分隔符可以换成别的符号,有时候替换目录字符串的时候有较多斜线，这个时候换成其它的分割符是较为方便,只需要紧跟s定义即可。
```
# 将分隔符换成问号”?”:
sed 's?原字符串?替换字符串?'
```
4. 可以在末尾加g替换每一个匹配的关键字,否则只替换每行的第一个,例如:
```
# 替换所有匹配关键字
sed 's/原字符串/替换字符串/g'
```
5. 一些特殊字符的使用

　　”^”表示行首

　　”$”符号如果在引号中表示行尾，但是在引号外却表示末行(最后一行)
```　　
# 注意这里的 " & " 符号，如果没有 “&”，就会直接将匹配到的字符串替换掉
sed 's/^/添加的头部&/g' 　　　　 #在所有行首添加
sed 's/$/&添加的尾部/g' 　　　　 #在所有行末添加
sed '2s/原字符串/替换字符串/g'　 #替换第2行
sed '$s/原字符串/替换字符串/g'   #替换最后一行
sed '2,5s/原字符串/替换字符串/g' #替换2到5行
sed '2,$s/原字符串/替换字符串/g' #替换2到最后一行
```
6. 批量替换字符串
```
sed -i "s/查找字段/替换字段/g" `grep 查找字段 -rl 路径`
sed -i "s/oldstring/newstring/g" `grep oldstring -rl yourdir
```
7. sed处理过的输出是直接输出到屏幕上的,使用参数”i”直接在文件中替换。

```
# 替换文件中的所有匹配项
sed -i 's/原字符串/替换字符串/g' filename
```
8. 多个替换可以在同一条命令中执行,用分号”;”分隔，其格式为:
```
# 同时执行两个替换规则
sed 's/^/添加的头部&/g；s/$/&添加的尾部/g'
```

# 运用 sed 命令高效地删除文件的特定行

正常来说，我们想要删除文件中的某些行内容，一般都是先打开这个文件，然后找到要删除的内容，再然后选中这些行并按删除键进行删除，这在数据量很少时是没有问题的。但是，一旦文件中的行数据非常多，而且数据冗杂的情况下，你还要用上面的方法去做的话就很恐怖了。为此，今天这篇文章将带大家一起学习运用 sed 命令行工具，即使在数据多而杂的情况下也能高效而优雅地删除文件中的特定行内容。

sed 是 Stream Editor 的简写，它用于在 Linux 中进行基本的文本转换，是文件操作的一个重要命令，所以，我们也可以用它来实现文本的删除操作。

下面是一些 sed 命令的使用示例，覆盖了大多数的使用场景，由浅入深地帮助你学习 sed 命令，让你轻松地实现高效删除文件的特定行内容。

首先我们准备一个演示文件 sed-demo.txt 。
```
# cat sed-demo.txt

1 Linux Operating System
2 Unix Operating System
3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
```
然后我们就可以运用 sed 命令进行实验了。

注意：-i 表示直接进行文件操作，而不在终端上显示结果。因为是演示所以这里不带 -i 选项，我们在实际中请带上 -i 选项。

1. 删除某一行
首先，我们先从删除某一行开始，比如删除第一行、最后一行，实际也就是第 N 行嘛。

删除第 N 行的命令格式：

sed 'Nd' file
我们来删除第一行试试：

# sed '1d' sed-demo.txt

After deletion:
2 Unix Operating System
3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
很简单是吧？这里就不多作解释了，你想要删除第几行的内容只需要把命令中的 1 替换一下就 ok 了。

那问题来了，最后一行用什么数字表示呢？这里给大家一个小提示，可以用美元符号 $ 表示最后，所以删除最后一行的命令可以这么写：
```
# sed '$d' sed-demo.txt
```
After deletion:
1 Linux Operating System
2 Unix Operating System
3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
2. 删除某些行
sed 命令可以删除连续又或者不连续的行内容。

删除连续的行，例如删除从 5 到 7 行 的内容：
```
# sed '5,7d' sed-demo.txt
```
After deletion:
1 Linux Operating System
2 Unix Operating System
3 RHEL
4 Red Hat
8 Debian
9 Ubuntu
10 openSUSE
删除不连续的行，例如删除第 1 、第 5 、第 9 和最后一行：
```
# sed '1d;5d;9d;$d' sed-demo.txt
```
After deletion:

2 Unix Operating System
3 RHEL
4 Red Hat
6 Arch Linux
7 CentOS
8 Debian
另外，它还可以配合逻辑非 ! 使用，比如删除第 3到 6 行以外的其他行：
```
# sed '3,6!d' sed-demo.txt
```
After deletion:

3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
3. 删除空白行

sed 还支持删除文件的空白行，命令如下：
```
# sed '/^$/d' sed-demo.txt
```
After deletion:

1 Linux Operating System
2 Unix Operating System
3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
提示：这里两个斜杠 / / 内的表达式起到了文本匹配的作用，大家可以参考正则表达式的使用方法。下面将列举一些常用的方法来加深大家的学习。

4. 删除包含特定字符的行
假设我们想要删除示例文件中的包含 System 这个单词的行内容，我们可以用 /System/，它表示有出现 System 这个字符串就进行匹配，具体的命令如下：
```
# sed '/System/d' sed-demo.txt
```
After deletion:

3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
不仅如此，我们还可以加上一下逻辑条件，比方说下面的命令：

# sed '/System\|Linux/d' sed-demo.txt

After deletion:

3 RHEL
4 Red Hat
5 Fedora
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
反斜杠 \ 代表逻辑或，上述命令的意思是文本中有 System 或 Linux 的行都要进行删除。

5. 删除特定字符开头的行

首先，我们创建另一个示例文件 sed-demo-1.txt 进行更好地演示，其内容如下：

# cat sed-demo-1.txt

After deletion:
Linux Operating System
Unix Operating System
RHEL
Red Hat
Fedora
debian
ubuntu
Arch Linux - 1
2 - Manjaro
3 4 5 6
上面也已经提到过，$ 号可以理解为结尾，那么有没有字符可以代表开头呢？答案是有的，这里我们可以用 ^ 号代表开头。

那么，我们想要删除以某一个字符开头的行时，比如说删除以 R 开头的行，可以使用如下命令：

# sed '/^R/d' sed-demo-1.txt

After deletion:
Linux Operating System
Unix Operating System
Fedora
debian
ubuntu
Arch Linux - 1
2 - Manjaro
3 4 5 6
那么问题来了，比如我想删除以 R 或者 F 开头的行，那我是不是要执行两次命令呢？如果是有更多岂不是要执行多次命令？这里它有一个简单的写法，你只要把这些字符写在一对中括号 [] 里就可以了：

# sed '/^[RF]/d' sed-demo-1.txt

After deletion:
Linux Operating System
Unix Operating System
debian
ubuntu
Arch Linux - 1
2 - Manjaro
3 4 5 6
上面命令的作用是 删除以 R 或者 F 开头的行。

6. 删除特定字符结尾的行

同上面一个道理，删除以某一个字符结尾的行，比方说删除以 m 结尾的行，我们可以这样做：

# sed '/m$/d' sed-demo.txt

After deletion:
3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
删除以 x 或 m 结尾的行可以这样写：

# sed '/[xm]$/d' sed-demo.txt

After deletion:

3 RHEL
4 Red Hat
5 Fedora
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
7. 删除以大写字母开头的行

这里问题又来了，我想要删除所有以大写字母开头的行呢？按照上面的做法是不是要将 A 到 Z 这 26 个字母都写进 [ ] 里呢？ 其实我们大可不必这样做，在 A 和 Z 中间加个 - 就可以了：

# sed '/^[A-Z]/d' sed-demo-1.txt

After deletion:
debian
ubuntu
2 - Manjaro
3 4 5 6
机智的你看到这里肯定会想到其他类似的用法的了，不妨看看下面是否有你想到的命令吧。

8. 删除包含字母字符的行

# sed '/[A-Za-z]/d' sed-demo-1.txt

After deletion:
3 4 5 6
9. 删除包含数字的行

# sed '/[0-9]/d' sed-demo-1.txt

After deletion:

Linux Operating System
Unix Operating System
RHEL
Red Hat
Fedora
debian
ubuntu
另外，通过这个例子，我们可以加上 ^ 和 $ 更好地看到他们三个之间的区别：

# sed '/^[0-9]/d' sed-demo-1.txt

After deletion:

Linux Operating System
Unix Operating System
RHEL
Red Hat
Fedora
debian
ubuntu
Arch Linux - 1
# sed '/[0-9]$/d' sed-demo-1.txt

After deletion:

Linux Operating System
Unix Operating System
RHEL
Red Hat
Fedora
debian
ubuntu
2 - Manjaro
10. 其他更多

实际上，我们要删除的文件内容是更为具体的，简单的条件是满足不了我们的需求的，所以，sed 也支持更复杂的条件组合。比方说我要指定删除在 1 到 6 行内有 Linux 这个词的内容，那么：

# sed '1,6{/Linux/d;}' sed-demo.txt

After deletion:
2 Unix Operating System
3 RHEL
4 Red Hat
5 Fedora
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
删除包含 System 以及其下一行的内容：

# sed '/System/{N;d;}' sed-demo.txt

After deletion:
3 RHEL
4 Red Hat
5 Fedora
6 Arch Linux
7 CentOS
8 Debian
9 Ubuntu
10 openSUSE
