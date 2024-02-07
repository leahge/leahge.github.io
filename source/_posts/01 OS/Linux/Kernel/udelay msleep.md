---
title: 关于udelay(); mdelay(); ndelay(); msleep();
date: 2022-10-16 18:59:05
tags:
---
在Ｌinux　Ｄriver开发中，经常要用到延迟函数：msleep，mdelay／udelay．

虽然msleep和mdelay都有延迟的作用，但他们是有区别的．

mdeday还忙等待函数，在延迟过程中无法运行其他任务．这个延迟的时间是准确的．是需要等待多少时间就会真正等待多少时间．而msleep是休眠函数，它不涉及忙等待．你如果是msleep(１０)，那实际上延迟的时间，大部分时候是要多于１０ms的，是个不定的时间值．

他们的差异，平时我也讲的出来，可是真正用起来的时候，就忘记了．曾在两个driver的i2c的code中，需要用到delay函数，而我用了msleep函数，一直Ｉ２Ｃ速度超慢．而我又不知道哪里出了问题，我潜意识中，认为我只delay了１ms，可是，实际上是十几毫秒．

 

这几个函数都是内核的延时函数：
1.

udelay(); mdelay(); ndelay();实现的原理本质上都是忙等待，ndelay和mdelay都是通过udelay衍生出来的，我们使用这些函数的实现往往会碰到编译器的警告implicit declaration of function'udelay'，这往往是由于头文件的使用不当造成的。在include/asm-???/delay.h中定义了udelay（），而在include/linux/delay.h中定义了mdelay和ndelay.

 

udelay一般适用于一个比较小的delay，如果你填的数大于2000，系统会认为你这个是一个错误的delay函数，因此如果需要2ms以上的delay需要使用mdelay函数。


2.由于这些delay函数本质上都是忙等待，对于长时间的忙等待意味这无谓的耗费着cpu的资源，因此对于毫秒级的延时，内核提供了msleep，ssleep等函数，这些函数将使得调用它的进程睡眠参数指定的时间。

 

应用层：
   #include <unistd.h>
   1、unsigned int sleep(unsigned int seconds); 秒级
   2、int usleep(useconds_t usec);              微秒级：1/10^-6
   #define _POSIX_C_SOURCE 199309
   #include <time.h>
   3、int nanosleep(const struct timespec *req, struct timespec *rem);
       struct timespec {
                  time_t tv_sec;        /* seconds */
                  long   tv_nsec;       /* nanoseconds */
              };
       // The value of the nanoseconds field must be in the range 0 to 999999999.
 
 内核层：
   include <linux/delay.h>
   1、void ndelay(unsigned long nsecs);         纳秒级：1/10^-10
   2、void udelay(unsigned long usecs);         微秒级: 1/10^-6
   3、void mdelay(unsigned long msecs);         毫秒级：1/10^-3

 

sleep_on(), interruptible_sleep_on(); 
sleep_on_timeout(), interruptible_sleep_on_timeout(); 
根据你的情况选用这些函数，注意： sleep操作在kernel必须小心、小心。。。 
udelay()等函数是cpu忙等，没有传统意义上的sleep。这些函数相当于我们平时的阻塞读、写之类的语义，主要用于等外设完成某些操作