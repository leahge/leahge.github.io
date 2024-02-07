最近读了【A Survey of Computer Architecture Simulation Techniques and Tools】，这篇文章汇总了常用的[模拟器](https://so.csdn.net/so/search?q=%E6%A8%A1%E6%8B%9F%E5%99%A8&spm=1001.2101.3001.7020)。

### 按照功能划分

#### Functional Simulator

<img src="a8c7a84d414e4c72addfd7db50f7517a.png">

#### Timing Simulator

<img src="227f2b29809a4e40b094bcba194349ce.png">

#### Timing&Functional Simulator

将fucntional和timing功能结合在一起的simulator

-   在指令执行的stage，执行指令的simulator即 execute-in-execute，比如Gem5
-   基于functional model的timing simulaor如 SimFlex GEMS 基于Simics，Sniper基于Pin。这类simulator分为以下三种：  
    <img src="575c2f3426b94c359fc2ec95141de362.png">
-   Timing-directed timing model负责指导functional model的执行
-   Functional-first model function model先执行，因为function model永远是执行正确的分支，因此相对于上一种，无法模拟分支预测错误路径的执行
-   Timing first model，functional负责验证timing model的结果。

### 按照输入划分

#### Trace driven simulator

我们可以通过收集程序的trace，比如在程序执行的过程中，持续的收集程序发出的load store操作的地址，将地址保存在trace 文件中，收集过一次之后，将trace文件作为输入，传递给simulator，进行仿真。  
常见的有champsim，输入address 的trace，传递给cache model，可以仿真cache miss hit，prefetcher的效果。  
[champsim](https://github.com/ChampSim/ChampSim)相对于其他模拟器好上手，代码也很简洁，并且已经附带了spec2017的trace文件，不需要搭建繁杂的环境，感兴趣的可以看一下。

#### Execution driven simulator

大部分的模拟器都是execution driven的，因为trace driven的模拟器要收集trace，而且收集的trace往往很大，不如直接将编译好的二进制文件传输给模拟器。  
<img src="03e0de34e3f34b069449bb6e64be9dcf.png">  
<img src="75deb8047d1d4b1591773cea599636c3.png"> 
最后比较一下我最近在使用的模拟器:


Pin/Sniper
pin相对于gem5快了很多，仿真1000Billion的指令，如果是functional model，可以12h内跑完，毕竟pin是基于instruction instrumentation，类似于java虚拟机，实现了dynamic instruction translation，直接在cpu上真实的跑，还是很快的。
Gem5
Gem5 即使atomic模式，12小时也只能25B，要是atomic模式跑1000B可能就要20天了。
Gem5胜在对cpu内部架构的详细模拟，因为详细，所以跑起来慢。Gem5现在提供了kvm cpu，基于kvm，也是在真实的cpu上跑，效果2h 10B~100B，还是没有pin快。
linux perf
linux perf工具也可以在真实的cpu上跑，不过只能是按照真实的intel的cpu得到真实的结果，这个肯定是最快的了。
ChampSim
ChampSim的代码相对于Gem5简洁太多，又因为使用trace，所以不像gem5那样遇到不支持的指令束手无策，也有很多顶会的文章是基于champsim。
Zsim
主要用于多核模拟，底层是基于pin，多核并发时，使用两阶段，bound-weave phase进行模拟，bound phase只是各个核内的执行，weave phase则对核间进行同步。这个survey里面介绍，zsim比gem5更加准确，还是有可能的。因为zsim基于pin，在真实的cpu上校验过，又是在真实的cpu上执行的，不像gem5很多内部设计的逻辑，只有intel和amd自己才知道。
zsim和sniper的核内模拟的原理个人理解有些相似，有些像岳灵珊的”岱宗如何“，通过进行数学计算得到cpu内部流水线各个阶段stage的当前拍数。
zsim核内：
<img src="2024-01-30-17-40-34.png">
zsim核间同步：
<img src="2024-01-30-17-39-43.png">
