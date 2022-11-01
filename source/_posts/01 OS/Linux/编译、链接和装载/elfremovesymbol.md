---
title: 剥离与导回符号表及调试信息
date: 2022-10-14 17:19:52
---
# [使用strip, eu-strip, objcopy等剥离与导回符号表及调试信息 | 易学教程](https://97id.com/2021/09/使用strip-eu-strip-objcopy等剥离与导回符号表及调试信息-易学教/)

# 1.符号表信息和调试信息

符号表信息（symbols）和调试信息（debug info）是由不同段区分的。
使用 readelf -S binfile 可以查看ELF文件的所有段。

调试信息相关的段：

```
<code># readelf -S a.out | grep debug

  [27] .debug_aranges    PROGBITS         0000000000000000  000016d0

  [28] .debug_info       PROGBITS         0000000000000000  00001700

  [29] .debug_abbrev     PROGBITS         0000000000000000  00001a0f

  [30] .debug_line       PROGBITS         0000000000000000  00001adb

  [31] .debug_str        PROGBITS         0000000000000000  00001bd2

</code>
```

符号表相关的段：

```
<code># readelf -S a.out | grep tab

  [32] .symtab           SYMTAB           0000000000000000  00001e18

  [33] .strtab           STRTAB           0000000000000000  00002670

  [34] .shstrtab         STRTAB           0000000000000000  00002a8f

</code>
```

注： 下文中提及的符号表相关段将不包括 .shstrtab 段，因其不会被strip或eu-strip移除。

RedHat的system libraries仍保留symbols；这使得它的库文件稍大，但调试方便；
Debian的system libraries不保留symbols，而是将symbols和调试信息都保存在.debug文件中; 这样, 系统库更小，但调试时需要拥有这些.debug文件。

# 2. strip命令

strip <option[s]> <in-file[s]>

常用选项如下：

```
<code>-s --strip-all

    Remove all symbol and relocation information

    注： 删除其他符号表段和调试信息段，但不删除 .shstrtab 段



-g -S -d --strip-debug

    Remove all debugging symbols & sections

    这几个选项的功能是一样，即移除上述5个".debug_"开头的调试信息段，仍会保留符号表



--only-keep-debug

    Strip everything but the debug information

    注：段的总数量没有减少，但文件大小减少了；对比了"readelf -S"输出中的"offset"段，发现其中前面若干段的offset都没有变化，即size为0了。



-R --remove-section=<name>

    Also remove section <name> from the output

    移除指定段，比如

    strip --remove-section=.symtab a.out

    strip --remove-section=.strtab a.out

</code>
```

不输入任何选项的默认行为是”-s”,即”–strip-all”.

# 3. eu-strip 命令

功能： 可将符号表和调试信息都导入指定文件中，以减小原二进制文件的大小。
至于如何将导出的文件告知gdb，请参见下面的第5节”objcopy命令”

使用举例：

```
<code>eu-strip a.out -f a.debug

</code>
```

以上命令将a.out中的符号表段和调试信息段都移出到 a.debug 文件中。这样，a.out的size会减小很多。
而此时，a.out 中会多一个 **.gnu_debuglink** 段，它是用来保存符号表位置的。
之后，再用gdb去打开并运行 a.out 时，gdb还可以找到 a.debug 这样的符号表及调试信息文件。

另注： CentOS安装eu-strip

```
<code>yum install elfutils

</code>
```

# 4. gdb 寻找符号表和调试信息文件

用 gdb 查看 coredump 的时候，或者用 gdb 去运行上述被剥离了符号表和调试信息的二进制文件时，gdb会去自动搜索符号表。
gdb 会去查找当前目录、gdb默认的搜索路径 /usr/lib/debug 、 以及 /usr/lib/debug 下的子路径。具体顺序和具体子路径，请参阅参考文档。

```
<code>(gdb) show debug-file-directory

The directory where separate debug symbols are searched for is "/usr/lib/debug".

</code>
```

如果符号表文件既不在当前目录，也不在 /usr/lib/debug, 那么可以使用 命令告诉gdb去哪里找到符号表，如下：

```
<code>(gdb) symbol-file /root/test.sym

(gdb) bt

</code>
```

# 5. objcopy 命令移除和添加符号表及调试信息

1. 删除指定的section

```
<code>    objcopy -R .comment -R .note.ABI-tag

</code>
```

1. 移除和添加符号表及调试信息

```
<code>    gcc -g -o test test.c



    # test.debug 将包含调试信息和符号表； 而test将只包含调试信息

    objcopy --only-keep-debug test test.debug



    # 从test文件里剥离debug段

    objcopy --strip-debug test



    # 更彻底地，上面这句可以换成下面这句以移除所有的debug信息和符号表

    strip -s test



    # 在二进制文件 test 中添加 .gnu_debuglink 段以指向符号表和调试信息文件

    objcopy --add-gnu-debuglink=test.debug test



    # objdump 命令可以查看指定的section

    objdump -s -j .gnu_debuglink test

</code>
```

# 6. 使用链接器ld去除符号表

动态链接库是ELF(Executable and Linkable Format)文件的一种,其中包含了2个符号表：

- .symtab 包含大量的信息（包括全局符号global symbols）

- .dynsym 只保留.symtab中的全局符号

  .dynsym 是 .symtab 的子集；strip命令会去掉ELF文件中.symtab,但不会去掉.dynsym

使用ld 的 -s 和 -S 选项可以在链接的时候去除符号表。-s去除所有符号表信息；-S去除调试符号信息。

```
<code>-s

--strip-all

    Omit all symbol information from the output file.



-S

--strip-debug

    Omit debugger symbol information (but not all symbols) from the output file.

</code>
```

# 7. gcc 静态编译

```
<code># 让可执行文件没有.dynsym动态链接表；在支持动态链接的系统上，阻止连接共享库。该选项在其它系统上无效。

gcc -static



# 让可执行文件没有.dynstr动态链接字符表；不连接系统标准启动文件和标准库文件，只把指定的文件传递给连接器。

gcc -nostdlib

</code>
```
