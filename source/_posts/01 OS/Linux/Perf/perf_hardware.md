---
title: PERF EVENT 硬件篇
date: 2022-10-13 10:51:46
---
# PERF EVENT 硬件篇

简介： 简介 本文将通过以 X86 为例子介绍硬件 PMU 如何为 linux kernel perf_event 子系统提供硬件性能采集功能 理解硬件 MSR （Model Specify Register） 可以理解为CPU硬件的专用寄存器，下述的所有寄存器都是这个类型 汇编指令 rdmsr/wrm.
## 简介
本文将通过以 X86 为例子介绍硬件 PMU 如何为 linux kernel perf_event 子系统提供硬件性能采集功能

## 理解硬件
MSR （Model Specify Register）

可以理解为CPU硬件的专用寄存器，下述的所有寄存器都是这个类型

汇编指令 rdmsr/wrmsr

```
wrmsr 0x38d 1234 # addr value
 ```
如果是 pmc 还可以用 rdpmc 指令
```
rdpmc [0~7] # input ECX output EDX:EAX
 ```

在硬件 pmu 的操作过程中大多类似以下模式

1. 写入 pmc 对应的状态 msr，决定要打开哪个硬件事件
2. 通过读取 pmc 获取之前定义的硬件事件数值
### PMCx 与 PERFEVTSELx

通用事件寄存器，成对出现，由 PERFEVTSEL 配置事件，PMC 读取事件数值。在现代 x86 产品中被称之为通用 pmu 设备，一般为4个，如果关闭虚拟化可以使用8个

### FIXED_CTRx 与 FIXED_CTR_CTRL

专用寄存器，通过唯一的 FIXED_CTR_CTRL 来开启对应的 FIXED_CTRx。无事件控制，每个 FIXED_CTRx 只能记录对应的硬件事件

RDT （Resource Direct Tech） 是一种全新的性能采集方式，有点与上述两种寄存器有所不同，但是在软件接口上会更简洁。支持 L3 cache 相关资源使用计数

它的操作过程不用定义事件类型，只要以下步骤

1. 通过 PQR_ASSOC msr寄存器写入 rmid 就已经开始统计相关事件的计数
2. 通过QM_EVTSEL 输入要读取的事件 id 和 rmid
3. 最后通过 QM_CTR 即可获得数据
可以看出它不再以单独的CPU为维度，用户可以自定义 rmid，可以用 task，也可以用 cpuid，甚至多者混合

## 操作
linux 系统提供了 msr 内核模块，允许用户可以在用户态直接操作 msr
```
ls /dev/cpu/0/msr
```
msr 都是 per-cpu 的设备，所以需要指定具体 cpu。 通过 lseek 来定位 msr，通过 write/read 来读写

通过这种方式来获取 cpu 性能是 bypass 内核，同样无法利用到 perf_event 子系统提供的一系列功能，比如关联某个 task， cgroup，也无法在有限的 pmu 个数中产生分时复用

## 总结
硬件 PMU 的实现就是提供了一系列的可操作 MSR， 通过 MSR 操作可以灵活定义要监控的内容，但是 linux kernel 中通过实现 perf_event 子系统对用户态提供了一套简洁通用的操作界面

## 其他
PERF_EVENT 系列文章

[PERF EVENT API篇](./perf_api.md)
[PERF EVENT 硬件篇](./perf_hardware.md)
[PERF EVENT 内核篇](./perf_kernel.md)
[PERF EVENT 硬件篇续](./perf_hardware2.md)
