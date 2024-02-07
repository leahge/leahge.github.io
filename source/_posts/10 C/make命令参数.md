---
title: make命令参数
date: 2024-02-03 21:26:55
tags:
---
## [](https://hongningexpro.github.io/2019/02/24/Makefile%E4%B9%8Bmake%E5%91%BD%E4%BB%A4%E5%8F%82%E6%95%B0/#make%E5%91%BD%E4%BB%A4%E5%8F%82%E6%95%B0%E4%BB%8B%E7%BB%8D "make命令参数介绍")make命令参数介绍

下面列举了所有GNU make 3.80版的参数定义。其它版本和产商的make大同小异，不过其它产商的make的具体参数还是请参考各自的产品文档。

-   “-b” “-m”：这两个参数的作用是忽略和其他版本make的兼容性
-   “-B” “–always-make”：认为所有目标都需要更新(重编译)
-   “-C dir” “–directory=dir”:指定makefile的目录。如果有多个”-C”参数，那么后边的路径会以前面的作为相对路径。如:”make -C ~/C\_Study/day03-makefile -C 03-make参数”,等价于”make -C ~/C\_Study/day03-makefile/03-make参数”。
-   “–debug=options”：输出make的调试信息。有几个不同的选项参数可以选择，如果没有参数，就输出最简单的调试信息。下面是options的取值:  
    a—也就是all，输出所有调试信息  
    b—也就是basic，只输出简单的调试信息。即输出不需要重编译的目标  
    v—也就是verbose，在b选项的基础之上，输出的信息包含哪个makefile被解析，不需要被重编译的依赖文件(或是依赖目标)等  
    i—也就是implicit，输出所有隐含规则  
    j—也就是jobs，输出执行规则中命令的详细信息，如命令的PID，返回值等  
    m—也就是makefile，输出make读取makefile，更新makefile，执行makefile的信息
-   “-d”:相当于”–debug=a”
-   “-e” “–environment-overrides”:指明环境变量的值覆盖makefile中定义的变量的值
-   “-f=file” “–file=file” “–makefile=file”：指定需要执行的makefile
-   “-h” “–help”：显示帮助信息
-   “-i” “–ignore-errors”:在执行时忽略所有的错误
-   “-Idir” “–include-dir=dir”:指定make命令搜索路径。可以使用多个”-I”参数指定多个目标
-   “-j(jobnums)” “–jobs=jobnums”:指同时运行命令的个数，如果没有指定此参数，那么make命令能运行多少就运行多少，如果有一个以上的”-j”参数，那么仅有最后一个才是有效的（注意这个参数在MS-DOS中是无效的）
-   “-k” “–keep-going”：出了错了不会停止运行，如果生成一个目标失败了，那么依赖于其上的目标就不会被执行了
-   “-l(load)” “–load-average=load” “–max-load=load”:指定make运行命令的负载
-   “-n” “–just-print” “–dry-run” “–recon”:仅输出执行过程中的命令序列，但并不执行
-   “-o(file)” “–old-file=file” “–assume-old=file”:不重新生成指定的file，即使这个目标的依赖文件新于它。
-   “-p” “–print-data-base”:输出makefile中的所有数据，包括所有的规则和变量。这个参数会让一个简单的makefile都输出一堆信息。如果你只是想输出信息而不想执行 makefile，你可以使用“make -qp”命令。如果你想查看执行makefile前的预设变量和规则，你可以使用“make –p –f /dev/null”。这个参数输出的信息会包含着你的makefile文件的文件名和行号，所以，用这个参数来调试你的makefile会是很有用的，特别是当你的环境变量很复杂的时候。
-   “q” “–question”:不运行命令，也不输出。仅仅检查所指定的目标是否需要更新，如果是0则说明需要更新，2说明有错误发生
-   “-r” “–no-builtin-rules”:禁止make使用任何隐含规则
-   “-R” “–no-builtin-varibles”：禁止make使用任何作用于变量上的隐含规则
-   “-s” “–slient” “–quiet”:在命令运行时不输出命令的输出
-   “-S” “–no-keep-going” “–stop”:取消“-k”选项的作用。因为有些时候，make的选项是从环境变量“MAKEFLAGS”中继承下来的。所以你可以在命令行中使用这个参数来让环境变量中的“-k”选项失效。
-   “-t” “–touch”:相当于UNIX的touch命令,只是把目标文件的修改日期变成最新的，也就是阻止生成目标的命令运行
-   “-v” “–version”：输出make程序的版本，版权等关于make的信息
-   “-w” “–print-directory”:输出运行makefile之前和之后的信息，这个参数对于跟踪嵌套式调用make时很有用。
-   “–no-print-directory”：禁止“-w”选项。
-   “-Wfile” “–what-if=file” “–new-file=file” “–assume-file=file”:假定目标file需要更新，如果和”-n”参数配合使用，会输出该目标更新时的运行动作，如果没有”-n”参数，这个命令和UNIX的touch命令一样，使得file修改时间为当前时间
-   “–warn-undefined-varibles”:只要make发现有未定义的变量，那么就输出警告信息

## [](https://hongningexpro.github.io/2019/02/24/Makefile%E4%B9%8Bmake%E5%91%BD%E4%BB%A4%E5%8F%82%E6%95%B0/#%E5%85%B3%E4%BA%8E%E5%8F%82%E6%95%B0%E2%80%9D-i%E2%80%9D%E5%92%8C%E2%80%9D-k%E2%80%9D%E7%9A%84%E5%8F%82%E6%95%B0%E5%8C%BA%E5%88%AB "关于参数”-i”和”-k”的参数区别")关于参数”-i”和”-k”的参数区别

上面介绍了一大通的命令参数，也没写什么好的例子来做演示，是因为我个人感觉好多参数用的很少。不过学习过程中让我疑惑的就是这两个参数，表面上解释看起来完全一个样子，如果是完全一样为什么要定义两个参数呢，带着疑惑我查了下资料，总算是搞明白了。

-   “-i”：这个参数是忽略运行过程中任何错误，并继续往下执行，也就是命令级别的忽略错误目标
-   “-k”：这个参数是当某个目标中出现错误，忽略此目标以及此目标依赖的生成规则，继续往上运行下一个目标  
    详细解释会比较麻烦，这里我把我查询的资料链接附上，有兴趣可以详细看[这里](https://blog.csdn.net/lfw19891101/article/details/6304296)。