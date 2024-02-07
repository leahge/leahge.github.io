title: O3 cpu源码解析
author: Leah Ge
date: 2024-01-29 14:58:20
tags:
-----

## O3 CPU代码分析

1.仿真前的初始化

```
src/sim/main.cc: importer() -> importInit()-> initAll()
src/python/embedded.cc: initAll()
src/sim/init.cc: initAll()-> pybind_init_event()
src/python/pybind11/event.cc: pybind_init_event() -> simulate()
src/sim/simulate.cc: simulate() -> doSimloop() -> serviceOne()
src/sim/eventq.cc: serviceOne() -> eventq.hh:event->process()
```

```
src/sim/main.cc: importer() -> src/python/importer.cc->importInit()-> initAll()
src/python/embedded.cc: initAll()
src/sim/init.cc: initAll()-> pybind_init_event()
src/python/pybind11/event.cc: pybind_init_event() -> simulate()
src/sim/simulate.cc: simulate() -> doSimloop() -> serviceOne()
src/sim/eventq.cc: serviceOne() -> eventq.hh:event->process()
```

Backend Pipeline
Compute Instructions
Compute instructions are simpler as they do not access memory and do not interact with the LSQ. Included below is a high-level calling chain (only important functions) with a description about the functionality of each.
```
Rename::tick()->Rename::RenameInsts()
IEW::tick()->IEW::dispatchInsts()
IEW::tick()->InstructionQueue::scheduleReadyInsts()
IEW::tick()->IEW::executeInsts()
IEW::tick()->IEW::writebackInsts()
Commit::tick()->Commit::commitInsts()->Commit::commitHead()
```
Load Instruction
Load instructions share the same path as compute instructions until execution.
```
IEW::tick()->IEW::executeInsts()
  ->LSQUnit::executeLoad()
    ->StaticInst::initiateAcc()
      ->LSQ::pushRequest()
        ->LSQUnit::read()
          ->LSQRequest::buildPackets()
          ->LSQRequest::sendPacketToCache()
    ->LSQUnit::checkViolation()
DcachePort::recvTimingResp()->LSQRequest::recvTimingResp()
  ->LSQUnit::completeDataAccess()
    ->LSQUnit::writeback()
      ->StaticInst::completeAcc()
      ->IEW::instToCommit()
IEW::tick()->IEW::writebackInsts()
```
Store Instruction
Store instructions are similar to load instructions, but only writeback to cache after committed.
```
IEW::tick()->IEW::executeInsts()
  ->LSQUnit::executeStore()
    ->StaticInst::initiateAcc()
      ->LSQ::pushRequest()
        ->LSQUnit::write()
    ->LSQUnit::checkViolation()
Commit::tick()->Commit::commitInsts()->Commit::commitHead()
IEW::tick()->LSQUnit::commitStores()
IEW::tick()->LSQUnit::writebackStores()
  ->LSQRequest::buildPackets()
  ->LSQRequest::sendPacketToCache()
  ->LSQUnit::storePostSend()
DcachePort::recvTimingResp()->LSQRequest::recvTimingResp()
  ->LSQUnit::completeDataAccess()
    ->LSQUnit::completeStore()
```

Branch Misspeculation
Branch misspeculation is handled in IEW::executeInsts(). It will notify the commit stage to start squashing all instructions in the ROB on the misspeculated branch.
```
IEW::tick()->IEW::executeInsts()->IEW::squashDueToBranch()
```
Memory Order Misspeculation
```
IEW::tick()->IEW::executeInsts()
  ->LSQUnit::executeLoad()
    ->StaticInst::initiateAcc()
    ->LSQUnit::checkViolation()
  ->IEW::squashDueToMemOrder()
```


##### 2\. 各级流水线

<img src="./b5bc4c70fd75ce520e1f75b6331ee5ab.png">

<img src="./bf53582d6cf98227857c682710973e1f.png">

<img src="./150881a2a51ee5f11b3e8a318677ab40.png">
[原文链接](http://www.icfgblog.com/index.php/riscv/351.html)


# 流水线
## 流水线阻塞
### 流水线冒险
#### 结构冒险
硬件不支持多条指令在同一时钟周期执行。比如抢占同一计算单元
#### 数据冒险
一个步骤必须等待另一个步骤完成才能进行。比如第二条指令的一个输入是上一条指令的输出。则可能需要等到第五步流水线才能获取到。
增加硬件以便从内部资源中提前获得缺失的项目成为前推（forwarding）或者旁路（bypassing）

流水线阻塞（pipeline stall）
#### 控制冒险（分支预测）
阻塞（stall） 
一：取出分支指令后立即阻塞流水线，直到流水线确定分支指令的结果并确定下一条真正执行指令的地址  
二：总是预测分支不发生  
三：预测一些分支发生而预测另一些不发生  
四：动态硬件预测器，保存每次条件分支的记录，利于哦那个近期行为预测将来。  
五：延迟分支。分支指令后放置不受分支影响的指令  

## 多发射
发射槽（issue slot）
循环展开（loop unrolling）:在循环展开中，编译器引入了额外的寄存器，这个过程被称为寄存器重命名（register renaming）

动态多发射处理器也称为超标量（superscalar）处理器

动态流水线调度（dynamic pipleline scheduling）

ROB/LQ/SQ  
ROB、LQ 和 SQ 是与超标量乱序执行处理器（Out-of-Order Execution）相关的概念，它们代表了处理器中的不同部件和队列，用于管理指令的执行和数据的加载/存储。以下是它们的解释：

- ROB（Reorder Buffer）：ROB 是乱序执行处理器中的关键部件之一。它是一个用于存储已调度但尚未执行的指令的缓冲区或队列。ROB 负责维护指令的乱序执行顺序，确保指令最终按照程序的顺序提交结果。ROB 还用于处理异常情况，例如分支预测失败时的指令回滚。ROB 的大小通常取决于处理器的设计，它越大，可以支持的并行执行就越多。

- LQ（Load Queue）：LQ 是用于管理内存加载（Load）操作的队列。在处理器中，许多指令需要从内存中加载数据，例如读取变量的值。LQ 用于跟踪这些加载操作，并确保加载的数据与指令所需的数据相关性正确。LQ 还有助于检测和解决内存相关性冲突，以确保指令的执行不会被阻塞。

-  SQ（Store Queue）：SQ 是用于管理内存存储（Store）操作的队列。类似于 LQ，SQ 负责跟踪和管理指令发出的存储操作，以确保数据的正确性。存储操作通常涉及将数据写入内存，因此 SQ 确保存储操作按照正确的顺序提交，以避免数据竞争和不一致。  
基础概念解释：
https://blog.csdn.net/lincolnjunior_lj/article/details/132904629