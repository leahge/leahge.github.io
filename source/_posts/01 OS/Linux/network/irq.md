---
title: 网卡多队列配置和中断绑定
date: 2022-10-27 20:44:45
tags:
---
# 网卡多队列配置

## 处理步骤

以下步骤云服务器默认主网卡为 `eth0`，网卡队列个数为2。

1. 执行以下命令，查看当前网卡队列个数。

   ```
   ethtool -l eth0
   ```

   返回如下结果，表示当前队列个数设置小于最大网卡队列个数，设置不合理，需进行修复。

   ```
   Channel parameters for eth0:
   Pre-set maximums:
   RX:             0
   TX:             0
   Other:          0
   Combined:       2         ### 服务器支持的最大网卡队列个数
   Current hardware settings:
   RX:             0
   TX:             0
   Other:          0
   Combined:       1        ###当前设置的网卡队列个数
   ```

2. 执行以下命令，设置当前网卡队列个数。

   ```
   ethtool -L eth0  combined 2
   ```

   命令中队列数设置为2，可根据实际情况调整，设置值为服务器支持的最大网卡队列个数。

3. 执行以下命令，检查当前网卡队列个数配置。

   ```
   ethtool -l eth
   ```

   服务器支持的最大网卡队列个数与当前设置的网卡队列个数相等，即为配置成功。

## Linux 多核下绑定硬件中断到不同 CPU

硬件中断发生频繁，是件很消耗 CPU 资源的事情，在多核 CPU 条件下如果有办法把大量硬件中断分配给不同的 CPU (core) 处理显然能很好的平衡性能。现在的服务器上动不动就是多 CPU 多核、多网卡、多硬盘，如果能让网卡中断独占1个 CPU (core)、磁盘 IO 中断独占1个 CPU 的话将会大大减轻单一 CPU 的负担、提高整体处理效率。VPSee 前天收到一位网友的邮件提到了 SMP IRQ Affinity，引发了今天的话题：D，以下操作在 SUN FIre X2100 M2 服务器＋ 64位版本 CentOS 5.5 + Linux 2.6.18-194.3.1.el5 上执行。

## 什么是中断

中文教材上对 “中断” 的定义太生硬了，简单的说就是，每个硬件设备（如：硬盘、网卡等）都需要和 CPU 有某种形式的通信以便 CPU 及时知道发生了什么事情，这样 CPU 可能就会放下手中的事情去处理应急事件，硬件设备主动打扰 CPU 的现象就可称为硬件中断，就像你正在工作的时候受到 QQ 干扰一样，一次 QQ 摇头就可以被称为中断。

中断是一种比较好的 CPU 和硬件沟通的方式，还有一种方式叫做轮询（polling），就是让 CPU 定时对硬件状态进行查询然后做相应处理，就好像你每隔5分钟去检查一下 QQ 看看有没有人找你一样，这种方式是不是很浪费你（CPU）的时间？所以中断是硬件主动的方式，比轮询（CPU 主动）更有效一些。

好了，这里又有了一个问题，每个硬件设备都中断，那么如何区分不同硬件呢？不同设备同时中断如何知道哪个中断是来自硬盘、哪个来自网卡呢？这个很容易，不是每个 QQ 号码都不相同吗？同样的，系统上的每个硬件设备都会被分配一个 IRQ 号，通过这个唯一的 IRQ 号就能区别张三和李四了。

在计算机里，中断是一种电信号，由硬件产生，并直接送到中断控制器（如 8259A）上，然后再由中断控制器向 CPU 发送信号，CPU 检测到该信号后，就中断当前的工作转而去处理中断。然后，处理器会通知操作系统已经产生中断，这样操作系统就会对这个中断进行适当的处理。现在来看一下中断控制器，常见的中断控制器有两种：可编程中断控制器 8259A 和高级可编程中断控制器（APIC），中断控制器应该在大学的硬件接口和计算机体系结构的相关课程中都学过。传统的 8259A 只适合单 CPU 的情况，现在都是多 CPU 多核的 SMP 体系，所以为了充分利用 SMP 体系结构、把中断传递给系统上的每个 CPU 以便更好实现并行和提高性能，Intel 引入了高级可编程中断控制器（APIC）。

光有高级可编程中断控制器的硬件支持还不够，Linux 内核还必须能利用到这些硬件特质，所以只有 kernel 2.4 以后的版本才支持把不同的硬件中断请求（IRQs）分配到特定的 CPU 上，这个绑定技术被称为 SMP IRQ Affinity. 更多介绍请参看 Linux 内核源代码自带的文档：linux-2.6.31.8/Documentation/IRQ-affinity.txt

## 如何绑定中断处理CPU

先看看系统上的中断是怎么分配在 CPU 上的，很显然 CPU0 上处理的中断多一些：

```
# cat /proc/interrupts   
           CPU0       CPU1         
  0:  918926335          0    IO-APIC-edge  timer  
  1:          2          0    IO-APIC-edge  i8042  
  8:          0          0    IO-APIC-edge  rtc  
  9:          0          0   IO-APIC-level  acpi  
 12:          4          0    IO-APIC-edge  i8042  
 14:    8248017          0    IO-APIC-edge  ide0  
 50:        194          0   IO-APIC-level  ohci_hcd:usb2  
 58:      31673          0   IO-APIC-level  sata_nv  
 90:    1070374          0         PCI-MSI  eth0  
233:         10          0   IO-APIC-level  ehci_hcd:usb1  
NMI:       5077       2032   
LOC:  918809969  918809894   
ERR:          0  
MIS:          0  
```

即能看到中断号，也能看到每个CPU的中断处理次数。

为了不让 CPU0 很累怎么把部分中断转移到 CPU1 上呢？或者说如何把 eth0 网卡的中断转到 CPU1 上呢？先查看一下 IRQ 90 中断的 smp affinity，看看当前中断是怎么分配在不同 CPU 上的（ffffffff 意味着分配在所有可用 CPU 上）：

```
# cat /proc/irq/90/smp_affinity   
7fffffff,ffffffff,ffffffff,ffffffff,ffffffff,ffffffff,ffffffff,ffffffff  
```

在进一步动手之前我们需要先停掉 IRQ 自动调节的服务进程，这样才能手动绑定 IRQ 到不同 CPU，否则自己手动绑定做的更改将会被自动调节进程给覆盖掉。如果想修改 IRQ 90 的中断处理，绑定到第2个 CPU（CPU1）：

```
# /etc/init.d/irqbalance stop  

# echo "2" > /proc/irq/90/smp_affinity  
```

（上面的 echo “2” 是怎么来的？为什么是 ”2“？请参考本文末尾：计算 SMP IRQ Affinity）过段时间在看 /proc/interrupts，是不是 90:eth0 在 CPU1 上的中断增加了（145）、在 CPU0 上的中断没变？不断打印 /proc/interrupts 就会发现 eth0 在 CPU0 上的中断数始终保持不变，而在 CPU1 上的中断数是持续增加的，这正是我们想要的结果：

```
# cat /proc/interrupts   
           CPU0       CPU1         
  0:  922506515          0    IO-APIC-edge  timer  
  1:          2          0    IO-APIC-edge  i8042  
  8:          0          0    IO-APIC-edge  rtc  
  9:          0          0   IO-APIC-level  acpi  
 12:          4          0    IO-APIC-edge  i8042  
 14:    8280147          0    IO-APIC-edge  ide0  
 50:        194          0   IO-APIC-level  ohci_hcd:usb2  
 58:      31907          0   IO-APIC-level  sata_nv  
 90:    1073399        145         PCI-MSI  eth0  
233:         10          0   IO-APIC-level  ehci_hcd:usb1  
NMI:       5093       2043   
LOC:  922389696  922389621   
ERR:          0  
MIS:          0  
```

## 有什么用

在网络非常 heavy 的情况下，对于文件服务器、高流量 Web 服务器这样的应用来说，把不同的网卡 IRQ 均衡绑定到不同的 CPU 上将会减轻某个 CPU 的负担，提高多个 CPU 整体处理中断的能力；对于数据库服务器这样的应用来说，把磁盘控制器绑到一个 CPU、把网卡绑定到另一个 CPU 将会提高数据库的响应时间、优化性能。合理的根据自己的生产环境和应用的特点来平衡 IRQ 中断有助于提高系统的整体吞吐能力和性能。

VPSee 经常收到网友来信问到如何优化 Linux、优化 VPS、这个问题不太好回答，要记住的是性能优化是一个过程而不是结果，不是看了些文档改了改参数就叫优化了，后面还需要大量的测试、监测以及持续的观察和改进。

## 其他

把irqbalance 停掉會不會有其他問題出玩?

不会有什么严重问题，但是没有 irqbalance 也没有合理的做手动 irq 绑定的话会有性能问题。手动 irq 只推荐给很 heavy、很特殊的情况，比如带多网卡多硬盘的网络存储服务器，一般机器一般应用还是用 irqbalance 省心。

事实上以前 Linux 是不推荐使用 irqbalance 的，原因在于当时的 irqbalance 实现很简单，没有什么优化作用，后来的 irqbalance (cache topology + power aware) 有了很大改进，在多核上表现良好。

## 计算 SMP IRQ Affinity

“echo 2 > /proc/irq/90/smp_affinity” 中的 ”2“ 是怎么来的，这其实是个二进制数字，代表 00000010，00000001 代表 CPU0 的话，00000010 就代表 CPU1， “echo 2 > /proc/irq/90/smp_affinity” 的意思就是说把 90 中断绑定到 00000010（CPU1）上。所以各个 CPU 用二进制和十六进制表示就是：

```
               Binary       Hex   
    CPU 0    00000001         1   
    CPU 1    00000010         2  
    CPU 2    00000100         4  
    CPU 3    00001000         8  
```

如果我想把 IRQ 绑定到 CPU2 上就是 00000100＝4：

```
# echo "4" > /proc/irq/90/smp_affinity  
```

如果我想把 IRQ 同时平衡到 CPU0 和 CPU2 上就是 00000001＋00000100＝00000101＝5

```
# echo "5" > /proc/irq/90/smp_affinity  
```

需要注意的是，在手动绑定 IRQ 到 CPU 之前需要先停掉 irqbalance 这个服务，irqbalance 是个服务进程、是用来自动绑定和平衡 IRQ 的：

```
# /etc/init.d/irqbalance stop  
```

还有一个限制就是，IO-APIC 有两种工作模式：

logic 和 physical，

在 logic 模式下 IO-APIC 可以同时分布同一种 IO 中断到8颗 CPU (core) 上（受到 bitmask 寄存器的限制，因为 bitmask 只有8位长。）；

在 physical 模式下不能同时分布同一中断到不同 CPU 上，比如，不能让 eth0 中断同时由 CPU0 和 CPU1 处理，这个时候只能定位 eth0 到 CPU0、eth1 到 CPU1，也就是说 eth0 中断不能像 logic 模式那样可以同时由多个 CPU 处理。

下面给大家提供一个计算小脚本值提供中断在单CPU上

```
#!/bin/bash  
#Author Jiaion MSN:Jiaion@msn.com  
[ $# -ne 1 ] && echo ‘$1 is Cpu core number’ && exit 1  

CCN=$1  
echo “Print eth0 affinity”  
for((i=0; i<${CCN}; i++))  
do  
echo ==============================  
echo "Cpu Core $i is affinity"  
((affinity=(1<<i)))  
echo "obase=16;${affinity}" | bc  
echo ==============================  
done  
```

### 1、关于多队列网卡

通过lspci方式查看网卡信息，如果有MSI-X， Enable+ 并且Count > 1，则该网卡是多队列网卡，多队列网卡内部会有多个 Ring Buffer。

```

[root@localhost ~]# lspci -vvv | grep -A50 "Ethernet controller" | grep -E "Capabilities|Ethernet controller"
01:00.0 Ethernet controller: Intel Corporation I350 Gigabit Network Connection (rev 01)
	Capabilities: [40] Power Management version 3
	Capabilities: [50] MSI: Enable- Count=1/1 Maskable+ 64bit+
	Capabilities: [70] MSI-X: Enable+ Count=10 Masked-
	Capabilities: [a0] Express (v2) Endpoint, MSI 00
	Capabilities: [e0] Vital Product Data

```
从以上信息可见，我们的这张网卡是支持多队列的。




### 2、网卡支持最大队列数及当前使用队列

我们可以通过ethtool命令查看网卡支持的最大队列数，
```
[root@localhost ~]# ethtool -l eth0
Channel parameters for eth0:
Pre-set maximums:
RX:		0
TX:		0
Other:		1
Combined:	63
Current hardware settings:
RX:		0
TX:		0
Other:		1
Combined:	40
```
由上可见，该网卡最多支持63个队列，当前使用了40个队列。为什么不开启63个队列呢，因为机器的CPU数没那么多，
```
[root@localhost ~]# cat /proc/cpuinfo | grep processor | wc -l
40
```
我们开启多队列的初衷就是为了利用多核。队列数和CPU相等，正好可以每个CPU处理一个队列，这样效率比较高。

### 3、修改网卡队列数

有时候网卡支持多队列却没有开启，那么就要手动设置网卡队列数，
```
ethtool -L eth0 combined 8
```

其中combined指的是网卡收发队列共用的情况，有些网卡可单独设置收发队列，
```
ethtool -L eth0 rx 8
ethtool -L eth0 tx 8
```
设置后可以在/sys/class/net/eth0/queues/目录下看到对应的队列，
```
[root@localhost ~]# cd /sys/class/net/eth0/queues/
[root@localhost queues]# ls
rx-0  rx-2  rx-4  rx-6  tx-0  tx-2  tx-4  tx-6
rx-1  rx-3  rx-5  rx-7  tx-1  tx-3  tx-5  tx-7
```
### 4、多队列网卡绑核

为了保证CPU均衡，也即是网卡中断能分配到各个CPU，我们通常会将网卡中断绑核，具体操作见——网卡中断均衡设置

### 5、单队列网卡

上面说的都是多队列网卡，那单队列的怎么搞呢，不能厚此薄彼吧。这时候就出现RPS和RFS了。简单来说就是在软件层面模拟多队列的情况，从而达到CPU均衡。

RPS（Receive Packet Steering）把软中断的负载均衡到各个cpu，是在单个CPU将数据从Ring Buffer取出来之后开始工作，网卡驱动通过四元组（SIP，SPORT，DIP，DPORT）生成一个hash值，然后根据这个hash值分配到对应的CPU上处理，从而发挥多核的能力。

但是还有个问题，由于RPS只是把数据包均衡到不同的cpu，但是收包的应用程序和软中断处理不一定是在同一个CPU，这样对于cpu cache的影响会很大。因此就出现RFS（Receive flow steering），它确保应用程序和软中断处理的cpu是同一个，从而能充分利用cpu的cache，这两个补丁往往都是一起设置，以达到最好的优化效果。

### 6、设置RPS

首先内核要开启CONFIG_RPS编译选项，然后设置需要将中断分配到哪些CPU,
```
 /sys/class/net/<dev>/queues/rx-<n>/rps_cpus
```
比如，要将eth0上0号收包软中断均匀分配到64个CPU上(假设机器上有这么多CPU)，那么可以如下操作，
```
 echo "ffffffff,ffffffff" > /sys/class/net/eth0/queues/rx-0/rps_cpus
```
和多队列中断绑定规则类似，每个CPU用1位表示，因此1,2,4,8分别对应0-3号CPU，分配到这些CPU，相加就是15，即f。

如果只想分配到前32个CPU，则可以如下操作，
```
 echo "00000000,ffffffff" > /sys/class/net/eth0/queues/rx-0/rps_cpus
```
### 7、设置RFS

上面我们说过RPS和RFS一般要配合使用，效果才最优，因此RFS同样需要开启CONFIG_RPS编译选项，同时设置每个队列的数据流表总数才能真正生效。

这里我们了解一下RFS的细节：

RFS的实现需要依赖两个表——全局socket流表(rps_sock_flow_table)和设备流表(rps_dev_flow_table)。全局socket流表记录的是每个流由上面RPS计算通过hash分配的CPU号，也就是期望的CPU号；设备流表存在于每个网络设备的每个接收队列，表中记录的是每个未完成流使用的CPU号，也就是当前流使用的CPU号。具体使用哪个CPU简单来说有以下规则，

如果两个表中记录的对应流使用的是同一个CPU号，就使用这个CPU
如果当前流使用的CPU未设置或者CPU处于离线状态，那就使用期望CPU表中的CPU号，也就是RPS计算而得的CPU号
如果两个表中对应流记录的CPU核不是同一个：
a)如果同一流的前一段数据包未处理完，为了避免乱序，不更换CPU，继续使用当前流使用的CPU号
b)如果同一流的前一段数据包已经处理完，那就可以使用期望CPU表中的CPU号
因此我们需要设置这两个表中记录的entry，对于全局socket流表(rps_sock_flow_table)，该配置接口是
```
/proc/sys/net/core/rps_sock_flow_entries
```
而设备流表(rps_dev_flow_table)则通过以下接口设置，
```
/sys/class/net/<dev>/queues/rx-<n>/rps_flow_cnt
```
两者的关系如下，
```
rps_sock_flow_entries = rps_flow_cnt * N
```
其中，N就是队列数量。因此，对于单队列网卡，两个值是一样的。

### 8、XPS(Transmit Packet Steering)

上面说的都是关于接收队列，那对于发送队列呢，这就需要用到XPS了。

XPS通过创建CPU到网卡发送队列的对应关系，来保证处理发送软中断请求的CPU和向外发送数据包的CPU是同一个CPU，用来保证发送数据包时候的局部性。

对于发送队列到CPU的映射有两种选择：

1、使用CPU映射
这种方式是通过指定发送队列在某几个CPU上处理，通过减小分发的CPU范围来减少锁开销以及cache miss。最常见的就是1对1，和上面说到的接收软中断绑核类似，通过以下接口设置，
```
/sys/class/net/<dev>/queues/tx-<n>/xps_cpus
```
同样是bitmaps方式。

2、接收队列映射方式
这种方式基于接收队列的映射来选择CPU，也就是说让接收队列和发送队列在同一个CPU，或指定范围的几个CPU来处理。这种方式对于多线程一直收发包的系统效果比较明显，收发包队列处理在同一个CPU，不仅减少了对其他CPU的打断，同时提高应用处理效率，收完包后直接在同个CPU继续发包，从而减小CPU消耗，同时减小包的时延。

这种方式映射，可通过一下接口设置(不是所有网卡都支持)，
```
/sys/class/net/<dev>/queues/tx-<n>/xps_rxqs
```
另外，XPS对于单发送队列网卡没有效果，这个可想而知。

参考资料：
1、https://www.kernel.org/doc/Documentation/networking/scaling.txt
