---
title: gem5 Minor CPU model 简介
date: 2024-01-26 09:40:55
tags:
---
## What is Minor

Minor 是包含一个流水线的in-order处理器模型[1](https://mickir.me/blog/In-Order%E6%A8%A1%E5%9E%8B%E6%98%AFgem5%E6%A8%A1%E6%8B%9F%E7%9A%84%E6%96%B0%E7%89%B9%E6%80%A7%EF%BC%8C%E6%B5%81%E6%B0%B4%E7%BA%A7%E4%B8%BA%E9%BB%98%E8%AE%A4%E4%BA%94%E7%BA%A7%E6%B5%81%E6%B0%B4%EF%BC%9A%E5%8F%96%E5%80%BC%E3%80%81%E8%AF%91%E7%A0%81%E3%80%81%E6%89%A7%E8%A1%8C%E3%80%81%E8%AE%BF%E5%AD%98%E3%80%81%E5%86%99%E5%9B%9E%E3%80%82%E5%B9%B6%E4%B8%94%E6%A8%A1%E6%8B%9F%E4%BA%86cache%E9%83%A8%E4%BB%B6%E3%80%81%E6%89%A7%E8%A1%8C%E9%83%A8%E4%BB%B6%E3%80%81%E5%88%86%E6%94%AF%E9%A2%84%E6%B5%8B%E9%83%A8%E4%BB%B6%E7%AD%89%E3%80%82), 其数据架构和运行行为都是可配置的. 用来运行in-order程序并且可以通过MinorTrace和minorview.py进行流水线的可视化. 它的目标是提供一个与一个类似功能的具体处理器联系的微架构的框架.

## Model structure

-   MinorCPU
    -   Pipeline
        -   Fetch1: 取多条指令
        -   Fetch2: 多条指令分解
        -   Decode: 指令译码
        -   Execute: 运行指令和数据存储接口

### Fetch1

Fetch1从指令寄存器取得cache lines或者部分 cache lines 并转发给 **Fetch2**, 由Fetch2将多行指令分解成指令们, 能从 **Execute** 和 **Fetch2** 获得’change of stream’信号来更改取指令的地址, **Execute** 的信号优先级更高.

Fetch1获得的每一行指令都有唯一的行号.

只有当Fetch2的输入空间有空余是Fetch1才会发起memory fetch

### Fetch2

Fetch2从 **Fetch1** 接受一行信息存入输入缓存, 缓存顶的行将会分解成独立的指令, 并将指令包装成指令向量传给 **Decode**

Fetch2包括分支预测机制, 这是gem5提供的分支预测接口的封装.

对所有控制指令进行分支预测.

### Decode

从 **Fetch2** 获得指令向量, 将指令分解成具体操作并封装. 传给下一级.

### Execute

提供所有指令运行和内存访问机制

在Execute内的指令包运行多个周期


