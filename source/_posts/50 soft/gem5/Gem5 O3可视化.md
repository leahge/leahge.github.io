---
title: Gem5 O3可视化
date: 2024-01-26 09:12:34
tags:
---
# Gem5 O3 可视化_gem5文档-CSDN博客



[icfg66](https://blog.csdn.net/qq_42556934 "icfg66") <img src="./newCurrentTime2.png"> 于 2022-08-01 09:35:42 发布

[Gem5](https://www.gem5.org/documentation/)是研究体系结构的硬件仿真工具，官方也提供了较详细的入门文档[gem5 documentation](https://www.gem5.org/documentation/)。

在研究超标量乱序CPU时，[Gem5](https://so.csdn.net/so/search?q=Gem5&spm=1001.2101.3001.7020)也提供了可视化样例[gem5: Visualization](https://www.gem5.org/documentation/general_docs/cpu_models/visualization/)

```
./build/RISCV/gem5.opt --debug-flags=O3PipeView --debug-start=78000 --debug-file=trace.out configs/example/se.py --cpu-type=O3CPU --caches --cmd=tests/tests-progs/hello/bin/riscv/linux/hello -m 230000
```

这个脚本会产生trace.out文件，记录[tick](https://so.csdn.net/so/search?q=tick&spm=1001.2101.3001.7020)(ps) 78000到230000时段的流水线信息。再通过python脚本生成pipeline.out文件，就可以通过less查看了

```
./util/o3-pipeview.py -c 500 -o pipeview.out --color m5out/trace.out
less -r pipeview.out
```

<img src="./653ba948b20c73e57614b64b948bc17d.png">

但这个方式存在两个问题：第一是可视化界面实在不友好，第二是很难找到main函数的核心代码。

### Konata

[Konata](https://github.com/shioyadan/Konata)是开源的Gem5 O3 pipeline可视化工具，只需要获得trace.out文件，再将其导入软件，就可以看大美观的[流水线](https://so.csdn.net/so/search?q=%E6%B5%81%E6%B0%B4%E7%BA%BF&spm=1001.2101.3001.7020)。  
<img src="./4d98877345eef1564ef60ecf6523349f.png">

但要找到main里的核心代码也不容易，main之前需要很多的铺垫：  
从`_start`函数运行很久才能到主函数  
<img src="./c599cbb05eeff7de21586fe832c939f2.png">

当然可以通过设置记录的起始时间解决，但还是不太方便。

### 编译链接

无意中刷到JYY老师的[操作系统：系统调用](https://www.bilibili.com/video/BV1N741177F5?p=3)可以通过`ld -e` 指定编译器从哪个函数开始执行。

比如一段简单的代码：

```
// hello.c
int main(){
  int sum = 0;
  for(int i = 0;i&lt;5;i++){
    sum+= i*i;
  }
  while(1);
  //return 0;
}
```

编译时可以先生成可重定向文件，在`ld -e`指定从main函数开始执行。

```
# 生成可重定向文件
riscv64-linux-gnu-gcc -c hello.c 
# 指定从main函数开始执行
riscv64-linux-gnu-ld -e main hello.o -o hello.elf
# 生成可读的汇编文件
riscv64-linux-gnu-objdum -S -D hello.elf &gt; hello.dump
```

查看汇编代码，可以看到只有短短的几行，没有`_start`函数。

<img src="./cdd423cc625ef2cc71f018bb859c47f6.png">

再运行gem5获得trace.out文件，可以看到确实从第一条指令`addi sp,sp,-32`开始执行，并呈现完整的5个循环。

<img src="./5da44860b8161637f05d7c11f98c8088.png">

<img src="./830fd0d0ff4682bba707b847b4f4c8b1.png">

最后需要注意的是，这里没有`return 0`，目的是为了运行gem5不产生错误信息。如果将`while(1)`替换为`return 0`，那么运行会报错`Segemtion fault (core dumped)`，因为return前没有初始化堆栈，造成错误的地址访问。

测试时可以先加`return 0`，确定退出的仿真时间，再换成`while(1)`, 根据仿真时间来结束仿真。

[原文链接](http://www.icfgblog.com/index.php/riscv/349.html)