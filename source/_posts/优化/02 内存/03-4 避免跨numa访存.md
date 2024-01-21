# numactl
不同NUMA内的CPU core访问同一个位置的内存，性能不同。内存访问延时从高到低为：跨CPU > 跨NUMA不跨CPU > NUMA内。

因此在应用程序运行时要尽可能的避免跨NUMA访问内存，我们可以通过设置线程的CPU亲和性来实现
通过numactl启动程序，如下面的启动命令表示启动test程序，只能在CPU core 28到core31运行（-C控制）,内存限定在numa node 0（-m 控制）。
numactl -C 28-31 -m 0 ./test
# docker
numactl可以限制程序的cpu和内存所在numa节点，但是内核可能夸numa，导致程序调用内核时出现跨numa访问。
查询内核所在内存位置：
·cat /proc/iomem |grep Kernel·
查询各numa访存起止地址
·dmesg｜grep node·
从而计算出内核所在numa节点
如果内核和程序不在同一node，可以使用虚拟化方式，比如在docker内运行程序，从而让让程序调用的内核和程序在同一节点，从而减少跨node访问
