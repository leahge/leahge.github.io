---
title: 网络IO
date: 2024-01-23 10:32:15
tags: 优化
---
# 概述
网络处理的流程最复杂，跟前面讲到的进程调度、中断处理、内存管理以及 I/O 等都密不可分。  
我们通常用带宽、吞吐量、延时、PPS（Packet Per Second）等指标衡量网络的性能。  
- 带宽，表示链路的最大传输速率，单位通常为 b/s （比特 / 秒）。
- 吞吐量，表示单位时间内成功传输的数据量，单位通常为 b/s（比特 / 秒）或者 B/s（字节 / 秒）。吞吐量受带宽限制，而吞吐量 / 带宽，也就是该网络的使用率。
- 延时，表示从网络请求发出后，一直到收到远端响应，所需要的时间延迟。在不同场景中，这一指标可能会有不同含义。比如，它可以表示，建立连接需要的时间（比如 TCP 握手延时），或一个数据包往返所需的时间（比如 RTT）。
- PPS，是 Packet Per Second（包 / 秒）的缩写，表示以网络包为单位的传输速率。PPS 通常用来评估网络的转发能力，比如硬件交换机，通常可以达到线性转发（即 PPS 可以达到或者接近理论最大值）。而基于 Linux 服务器的转发，则容易受网络包大小的影响。  
除了这些指标，网络的可用性（网络能否正常通信）、并发连接数（TCP 连接数量）、丢包率（丢包百分比）、重传率（重新传输的网络包比例）等也是常用的性能指标。

# 监控分析工具
| 工具                                                        | 说明                       |
| ----------------------------------------------------------- | -------------------------- |
| ifconfig<br>ip                                              | 配置和查看网络接口         |
| sar<br>/proc/net <br>/sys/class/net/enP11s137f0/statistics/ | 查看网络接口的网络收发情况 |
| ethtool                                                     | 查看和配置网络接口         |
| route <br>traceroute                                        | 查看、测试路由             |
| tcpdump                                                     | 网络抓包工具               |
| wireshark                                                   | 网络抓包和图形界面分析工具 |
| iptables                                                    | 管理配置防火墙             |
| netstat                                                     | 多种网络栈和接口统计信息   |


# 优化方法


## 应用和网卡绑定同一NUMA Node
当网卡收到大量请求时，会产生大量的中断，操作系统通过Irqbalance服务来确定网卡队列中的网络数据包交由哪个CPU core处理，但是当处理中断的CPU core和网卡不在一个NUMA时，会触发跨NUMA访问内存。因此，我们可以将处理网卡中断的CPU core设置在网卡所在的NUMA上，从而减少跨NUMA的内存访问所带来的额外开销，提升网络处理性能。
## 使用epoll取代select和poll
多路复用技术 epoll

## 异步 I/O（Asynchronous I/O，AIO）
AIO 允许应用程序同时发起很多 I/O 操作，而不用等待这些操作完成。等到 I/O 完成后，系统会用事件通知的方式，告诉应用程序结果。不过，AIO 的使用比较复杂，你需要小心处理很多边缘情况。

## 监听相同端口的多进程模型
在这种模型下，所有进程都会监听相同接口，并且开启 SO_REUSEPORT 选项，由内核负责，把请求负载均衡到这些监听进程中去。
## 系统级可调参数
系统级可调参数可以用sysctl命令查看和设置
### 套接字和TCP缓冲
所有协议类型的读系最大套接字缓存大小：
```
net.core.rmem_max
net.core.wmem_max
```

启用TCP接受缓冲的自动调整：
``` net.ipv4.tcp_moderate_rcvbuf=1 ```  
TCP读写设置自动调优参数
``` 
net.ipv4.tcp_rmem
net.ipv4.tcp_wmem 
``` 
每个参数有三个数值：可使用的最小、默认和最大字节数  
udp缓冲范围：
```net.ipv4.udp_mem```
### TCP选项
- 增大处于 TIME_WAIT 状态的连接数量 net.ipv4.tcp_max_tw_buckets ，并增大连接跟踪表的大小 net.netfilter.nf_conntrack_max。
- 减小 net.ipv4.tcp_fin_timeout 和 net.netfilter.nf_conntrack_tcp_timeout_time_wait ，让系统尽快释放它们所占用的资源。
- 开启端口复用 net.ipv4.tcp_tw_reuse。这样，被 TIME_WAIT 状态占用的端口，还能用到新建的连接中。
- 增大本地端口的范围 net.ipv4.ip_local_port_range 。这样就可以支持更多连接，提高整体的并发能力
- 增加最大文件描述符的数量。你可以使用 fs.nr_open 和 fs.file-max ，分别增大进程和系统的最大文件描述符数；或在应用程序的 systemd 配置文件中，配置 LimitNOFILE ，设置应用程序的最大文件描述符数。

## 调整MTU大小
MTU 的大小应该根据以太网的标准来设置。以太网标准规定，一个网络帧最大为 1518B，那么去掉以太网头部的 18B 后，剩余的 1500 就是以太网 MTU 的大小。

在使用 VXLAN、GRE 等叠加网络技术时，要注意，网络叠加会使原来的网络包变大，导致 MTU 也需要调整。  
现在很多网络设备都支持巨帧，如果是这种环境，你还可以把 MTU 调大为 9000，以提高网络吞吐量。
## ICMP选项
避免 ICMP 主机探测、ICMP Flood 等各种网络问题，你可以通过内核选项，来限制 ICMP 的行为。
- 你可以禁止 ICMP 协议，即设置 net.ipv4.icmp_echo_ignore_all = 1。这样，外部主机就无法通过 ICMP 来探测主机。

- 还可以禁止广播 ICMP，即设置 net.ipv4.icmp_echo_ignore_broadcasts = 1。

## 中断处理优化
由于网卡收包后调用的中断处理程序（特别是软中断），需要消耗大量的 CPU。所以，将这些中断处理程序调度到不同的 CPU 上执行，就可以显著提高网络吞吐量。这通常可以采用下面两种方法。

1. 为网卡硬中断配置 CPU 亲和性（smp_affinity），或者开启 irqbalance 服务。

2. 开启 RPS（Receive Packet Steering）和 RFS（Receive Flow Steering），将应用程序和软中断的处理，调度到相同 CPU 上，这样就可以增加 CPU 缓存命中率，减少网络延迟。  


另外，现在的网卡都有很丰富的功能，原来在内核中通过软件处理的功能，可以卸载到网卡中，通过硬件来执行。

- TSO（TCP Segmentation Offload）和 UFO（UDP Fragmentation Offload）：在 TCP/UDP 协议中直接发送大包；而 TCP 包的分段（按照 MSS 分段）和 UDP 的分片（按照 MTU 分片）功能，由网卡来完成 。

- GSO（Generic Segmentation Offload）：在网卡不支持 TSO/UFO 时，将 TCP/UDP 包的分段，延迟到进入网卡前再执行。这样，不仅可以减少 CPU 的消耗，还可以在发生丢包时只重传分段后的包。

- LRO（Large Receive Offload）：在接收 TCP 分段包时，由网卡将其组装合并后，再交给上层网络处理。不过要注意，在需要 IP 转发的情况下，不能开启 LRO，因为如果多个包的头部信息不一致，LRO 合并会导致网络包的校验错误。

- GRO（Generic Receive Offload）：GRO 修复了 LRO 的缺陷，并且更为通用，同时支持 TCP 和 UDP。

- RSS（Receive Side Scaling）：也称为多队列接收，它基于硬件的多个接收队列，来分配网络接收进程，这样可以让多个 CPU 来处理接收到的网络包。

- VXLAN 卸载：也就是让网卡来完成 VXLAN 的组包功能。
### RPS和 RFS
#### 优化原理
RPS就是在软件层面模拟多队列的情况，从而达到CPU均衡。 RPS（Receive Packet Steering）把软中断的负载均衡到各个cpu，是在单个CPU将数据从Ring Buffer取出来之后开始工作，网卡驱动通过四元组（SIP，SPORT，DIP，DPORT）生成一个hash值，然后根据这个hash值分配到对应的CPU上处理，从而发挥多核的能力。 但是还有个问题，由于RPS只是把数据包均衡到不同的cpu，但是收包的应用程序和软中断处理不一定是在同一个CPU，这样对于cpu cache的影响会很大。因此就出现RFS（Receive flow steering），它确保应用程序和软中断处理的cpu是同一个，从而能充分利用cpu的cache，这两个补丁往往都是一起设置，以达到最好的优化效果。
#### 使用方法
##### 启用方法
1. 设置RPS
首先内核要开启CONFIG_RPS编译选项，然后设置需要将中断分配到哪些CPU,
```echo <cpu_mask> > /sys/class/net/<dev>/queues/rx-<n>/rps_cpus```
2. 设置RFS
RFS的实现需要依赖两个表——全局socket流表(rps_sock_flow_table)和设备流表(rps_dev_flow_table)。全局socket流表记录的是每个流由上面RPS计算通过hash分配的CPU号，也就是期望的CPU号；设备流表存在于每个网络设备的每个接收队列，表中记录的是每个未完成流使用的CPU号，也就是当前流使用的CPU号。具体使用哪个CPU简单来说有以下规则：
- 如果两个表中记录的对应流使用的是同一个CPU号，就使用这个CPU
- 如果当前流使用的CPU未设置或者CPU处于离线状态，那就使用期望CPU表中的CPU号，也就是RPS计算而得的CPU号
- 如果两个表中对应流记录的CPU核不是同一个：
- 如果同一流的前一段数据包未处理完，为了避免乱序，不更换CPU，继续使用当前流使用的CPU号
- 如果同一流的前一段数据包已经处理完，那就可以使用期望CPU表中的CPU号
因此我们需要设置这两个表中记录的entry，对于全局socket流表(rps_sock_flow_table)，该配置接口是：
/proc/sys/net/core/rps_sock_flow_entries
rps_sock_flow_entries 红帽是建议设置成 32768，一般设置成最大并发链接数量
而设备流表(rps_dev_flow_table)则通过以下接口设置：
```/sys/class/net/<dev>/queues/rx-<n>/rps_flow_cnt```
两者的关系如下:
rps_sock_flow_entries = rps_flow_cnt * n
##### 关闭方法
1. 关闭RPS
按照如下方法关闭RPS：
```echo 0 > /sys/class/net/<dev>/queues/rx-<n>/rps_cpus```
1. 关闭RFS
按照如下方式关闭RFS：
```
/sys/class/net/eth0/queues/rx-<n>/rps_flow_cnt 0
/proc/sys/net/core/rps_sock_flow_entries 0
```

### 中断聚合参数调整
中断聚合特性允许网卡收到报文之后不立即产生中断，而是等待一小段时间有更多的报文到达之后再产生中断，这样就能让CPU一次中断处理多个报文，减少开销。

修改方式
使用ethtool -C $eth方法调整中断聚合参数。其中参数“$eth”为待调整配置的网卡设备名称，如eth0，eth1等。
```
# ethtool -C eth3 adaptive-rx off adaptive-tx off rx-usecs N rx-frames N tx-usecs N tx-frames N
```
为了确保使用静态值，需禁用自适应调节，关闭Adaptive RX和Adaptive TX。  
- rx-usecs：设置接收中断延时的时间。
- tx-usecs：设置发送中断延时的时间。
- rx-frames：产生中断之前接收的数据包数量。
- tx-frames：产生中断之前发送的数据包数量。
这4个参数设置N的数值越大，中断越少。

### XPS
#### 优化原理
XPS全称是Transmit Packet Steering，该特性主要是针对多队列网卡发送时的优化，当发送一个数据包的时候，它会根据cpu来选择对应的队列， 线上设备偶尔会出现各cpu softirq消耗不均的情况，有的cpu甚至被softirq打满，成为性能瓶颈。
#### 使用方法
##### 启用方法
XPS有两种使用方式，推荐使用第一种方式。
1. 使用CPU映射
这种方式是通过指定发送队列在某几个CPU上处理，通过减小分发的CPU范围来减少锁开销以及cache miss。最常见的就是1对1，通过以下命令设置，注意要对所有tx进行设置。
```echo <cpu_mask> > /sys/class/net/<dev>/queues/tx-<n>/xps_cpus```
说明：代表对应CPU的十六进制表示。
1. 接收队列映射方式
这种方式基于接收队列的映射来选择CPU，也就是说让接收队列和发送队列在同一个CPU，或指定范围的几个CPU来处理。这种方式对于多线程一直收发包的系统效果比较明显，收发包队列处理在同一个CPU，不仅减少了对其他CPU的打断，同时提高应用处理效率，收完包后直接在同个CPU继续发包，从而减小CPU消耗，同时减小包的时延。同样需要注意要对所有tx进行设置，不过，这种方式不是所有网卡都支持。
```echo <cpu_mask> > /sys/class/net/<dev>/queues/tx-<n>/xps_rxqs```
##### 关闭方法
对于第一种使用方式，按照如下方法关闭XPS：
```echo 0 > /sys/class/net/eth0/queues/tx-0/xps_cpus```
针对第二种使用方式，按照如下方法关闭XPS：
```echo 0 > /sys/class/net/<dev>/queues/tx-<n>/xps_rxqs```


## tuned配置
tuned提供了基于可选配文件的自动调优。用户可以根据自己的需要选择不同的配置，例如：
- 追求低时延，可以选择network-latency模式。
- 追求高网络IO吞吐，可以选择network-throughput模式。
- 追求低IO时延，可以选择latency-performance模式。
- 追求高IO吞吐，可以选择throughput-performance模式。
可用的配置文件可以使用以下方式列出
 ```tuned-adm list```
想要知道某个配置文件设置了哪些可调项，可以从tuned的源码中读取该配置文件
```more tuned/profiles/network-latency/tuned.conf```

tuned常用命令
| 说明                    | 操作                      |
| ----------------------- | ------------------------- |
| 查看tuned服务运行状态   | systemctl status tuned    |
| 查看当前运行的tuned模式 | tuned-adm active          |
| 查看支持的tuned模式     | tuned-adm list            |
| 设置所需tuned模式       | tuned-adm profile $config |
| 不应用tuned模式配置     | tuned-adm off             |