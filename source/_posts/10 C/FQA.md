---
title: FQA
date: 2024-02-03 20:53:05
tags:
---
1.  undefined symbol 如 __aarch64_swp1_acq_rel等
libgcc linker error: hidden symbol __aarch64_swp1_acq_rel in libgcc.a is referenced by DSO
解决方法：gcc10以上Compile it with cflags "-mno-outline-atomics" 
否则动态链接不到libgcc.a
例如，Makefile
$(MAKE) EXTRA_CFLAGS="-g  -mno-outline-atomics" -C /lib/modules/$(shell uname -r)/build M=`pwd` modules