---
title: ARM汇编
date: 2024-01-31 11:12:59
tags:
---
# 寄存器
The A64 ISA provides 31 general-purpose registers. For this guide, we will say that these registers
are called x0 to x30, and they each contain 64 bits of data.  
Each register can be used as a 64-bit x register (x0..x30), or as a 32-bit w register
(w0..w30).
<img src="./2024-01-31-11-22-44.png">

There is a separate set of 32 registers used for floating point and vector operations
hese registers are 128-bit, but like the general-purpose registers, can be accessed in several ways. Bx is 8 bits, Hx is 16 bits and so on to Qx which is 128 bits.
<img src="./2024-01-31-11-25-00.png">


流水线--cortex的 不是N2的？
<img src="./2024-01-31-13-49-06.png">