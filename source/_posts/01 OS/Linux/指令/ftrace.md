---
title: ftrace
date: 2022-10-13 20:18:51
tags:
---

## [Linux ftrace框架介绍及运用](https://www.cnblogs.com/arnoldlu/p/7211249.html)

目录：

[1. ftrace背景](https://www.cnblogs.com/arnoldlu/p/7211249.html#ftrace_background)

[2. 框架介绍](https://www.cnblogs.com/arnoldlu/p/7211249.html#ftrace_framework)

[3. 主要代码分析](https://www.cnblogs.com/arnoldlu/p/7211249.html#ftrace_code_analyze)

[4. ftrace的配置和使用](https://www.cnblogs.com/arnoldlu/p/7211249.html#ftrace_setting)

[5. ftrace相关工具](https://www.cnblogs.com/arnoldlu/p/7211249.html#ftrace_tools)



在日常工作中，经常会需要对内核进行Debug、或者进行优化工作。一些简单的问题，可以通过dmesg/printk查看，优化借助一些工具进行。

但是当问题逻辑复杂，优化面宽泛的时候，往往无从下手。

需要从上到下、模块到模块之间分析，这时候就不得不借助于Linux提供的静态(Trace Event)动态(各种Tracer)进行分析。

同时还不得不借助工具、或者编写脚本进行分析，以缩小问题范围、发现问题。

简单的使用Tracepoint已经不能满足需求，因此就花点精力进行梳理。

# 1. ftrace背景

ftrace是Function Trace的意思，最开始主要用于记录内核函数运行轨迹；随着功能的逐渐增加，演变成一个跟踪框架。

包含了静态tracepoint，针对不同subsystem提供一个目录进行开关；还包括不同的动态跟踪器，function、function_graph、wakeup等等。

ftrace的帮助文档在[Documentation/trace](http://elixir.free-electrons.com/linux/v3.4.110/source/Documentation/trace)，ftrace代码主要在[kernel/trace](http://elixir.free-electrons.com/linux/v3.4.110/source/kernel/trace)，ftrace相关头文件在[include/trace](http://elixir.free-electrons.com/linux/v3.4.110/source/include/trace)中。

WiKiPedia有关于[ftrace](https://en.wikipedia.org/wiki/Ftrace)的简单介绍。

ftrace的作者在LinuxCon 2010有一篇关于**[Ftrace Linux Kernel Tracing](https://events.static.linuxfound.org/slides/2010/linuxcon_japan/linuxcon_jp2010_rostedt.pdf)**的slides值得一读。

# 2. ftrace框架介绍

整个ftrace框架可以分为几部分：ftrace核心框架，RingBuffer，debugfs，Tracepoint，各种Tracer。

ftrace框架是整个ftrace功能的纽带，包括对内和的修改，Tracer的注册，RingBuffer的控制等等。

RingBuffer是静态动态ftrace的载体。

debugfs则提供了用户空间对ftrace设置接口。

Tracepoint是静态trace，他需要提前编译进内核;可以定制打印内容，自由添加;并且内核对主要subsystem提供了Tracepoint。

Tracer有很多种，主要几大类：

> 函数类：function， function_graph， stack
>
> 延时类：irqsoff， preemptoff， preemptirqsoff， wakeup， wakeup_rt， waktup_dl
>
> 其他类：nop， mmiotrace， blk

![ftrace 组成](https://www.ibm.com/developerworks/cn/linux/l-cn-ftrace/image001.jpg)

## 2.1 ftrace核心初始化

 trace.c是ftrace的核心，包括三个initcall：tracer_alloc_buffers、trace_init_debugfs、clear_boot_tracer。



```
start_kernel-->
    trace_init-->
        tracer_alloc_buffers--------------------分配ftrace需要的RingBuffer
            register_tracer(&nop_trace)---------默认nop跟踪器
        trace_event_init------------------------创建静态Trace Event，进行初始化。


fs_initcall(tracer_init_debugfs);-->
    tracing_init_dentry--------------------------在sys/kernel/debug下，创建tracing目录
    init_tracer_debugfs--------------------------
        ftrace_create_function_files-------------创建主要的tracing目录下节点
            allocate_ftrace_ops------------------function_trace_call
            ftrace_create_filter_files-----------创建function tracer相关的节点set_ftrace_filter/set_ftrace_notrace
    trace_create_file----------------------------创建saved_cmdlines等
    create_trace_instances-----------------------创建tracing/instances/目录
    create_trace_options_dir---------------------创建tracing/optoins/目录
    tracing_init_debugfs_percpu------------------创建per_cpu目录
late_initcall(clear_boot_tracer);
```



 tracer_alloc_buffers主要申请一个最小1KB的RingBuffer，然后注册一些Notifier和初始化一些列表。



```
__init static int tracer_alloc_buffers(void)
{
...
    /* To save memory, keep the ring buffer size to its minimum */
    if (ring_buffer_expanded)----------------------------------------------在初始化的时候，分配一个最小量
        ring_buf_size = trace_buf_size;
    else
        ring_buf_size = 1;
...
    /* TODO: make the number of buffers hot pluggable with CPUS */
    if (allocate_trace_buffers(&global_trace, ring_buf_size) < 0) {--------分配RingBuffer内存
        printk(KERN_ERR "tracer: failed to allocate ring buffer!\n");
        WARN_ON(1);
        goto out_free_savedcmd;
    }
...
    /*
     * register_tracer() might reference current_trace, so it
     * needs to be set before we register anything. This is
     * just a bootstrap of current_trace anyway.
     */
    global_trace.current_trace = &nop_trace;----------------------------默认nop跟踪器

    global_trace.max_lock = (arch_spinlock_t)__ARCH_SPIN_LOCK_UNLOCKED;

    ftrace_init_global_array_ops(&global_trace);

    register_tracer(&nop_trace);----------------------------------------注册nop跟踪器

    /* All seems OK, enable tracing */
    tracing_disabled = 0;

    atomic_notifier_chain_register(&panic_notifier_list,
                       &trace_panic_notifier);

    register_die_notifier(&trace_die_notifier);

    global_trace.flags = TRACE_ARRAY_FL_GLOBAL;

    INIT_LIST_HEAD(&global_trace.systems);
    INIT_LIST_HEAD(&global_trace.events);
    list_add(&global_trace.list, &ftrace_trace_arrays);

    while (trace_boot_options) {
        char *option;

        option = strsep(&trace_boot_options, ",");
        trace_set_options(&global_trace, option);
    }

    register_snapshot_cmd();------------------------------------------创建snapshot节点
...
}
```





## 2.2 trace event

 在trace_init-->trace_event_init-->event_trace_enable中，已经创建了tracing/events下的节点，并且做好了准备工作。

event_trace_enable被初次调用的地方很靠前，甚至在pid 1之前。



```
void __init trace_event_init(void)
{
    event_trace_memsetup();------------------------------------------创建field_cachep、file_cachep高速缓存
    init_ftrace_syscalls();------------------------------------------对所有系统调用如后保存在syscalls_metadata
    event_trace_enable();--------------------------------------------在系统启动阶段初始化Trace Event，在debug创建后在附着到上面
}

static __init int event_trace_enable(void)
{
    struct trace_array *tr = top_trace_array();
    struct ftrace_event_call **iter, *call;
    int ret;

    if (!tr)
        return -ENODEV;

    for_each_event(iter, __start_ftrace_events, __stop_ftrace_events) {----------遍历所有的Events，放入ftrace_events链表

        call = *iter;
        ret = event_init(call);
        if (!ret)
            list_add(&call->list, &ftrace_events);
    }

    /*
     * We need the top trace array to have a working set of trace
     * points at early init, before the debug files and directories
     * are created. Create the file entries now, and attach them
     * to the actual file dentries later.
     */
    __trace_early_add_events(tr);

    early_enable_events(tr, false);

    trace_printk_start_comm();

    register_event_cmds();--------------------------------------------------------注册enable_event、disable_event两个命令

    register_trigger_cmds();------------------------------------------------------注册traceon、traceoff、snapshot等命令

    return 0;
}
```





其他Events相关初始化如下：
```
early_initcall(event_trace_enable_again);----------在trace_event_init已经调用过early_enable_events，这里在early_initcall再次使能。

fs_initcall(event_trace_init);---------------------创建available_events节点
```


##  2.3 function跟踪器

function tracer的初始化通过init_function_trace建立。

`core_initcall(init_function_trace);`

init_function_trace在init_func_cmd_traceon中，创建了一系列命令：traceon/traceoff/stacktrace/dump/cpudump。然后是注册function_trace这个tracer。

Tracer结构体如下:



```
static struct tracer function_trace __tracer_data =
{
    .name        = "function",
    .init        = function_trace_init,--------------通过echo function > current_tracer触发
    .reset        = function_trace_reset,------------通过echo 1 >tracing_on触发
    .start        = function_trace_start,------------通过echo 0 >tracing_off触发
    .flags        = &func_flags,
    .set_flag    = func_set_flag,
    .allow_instances = true,
#ifdef CONFIG_FTRACE_SELFTEST
    .selftest    = trace_selftest_startup_function,
#endif
}
```



 function_trace_init进行function tracer相关设置。

##  2.4 function_graph跟踪器

注册function_graph跟踪器，创建max_graph_depth节点。



```
static struct tracer graph_trace __tracer_data = {
    .name        = "function_graph",
    .update_thresh    = graph_trace_update_thresh,
    .open        = graph_trace_open,
    .pipe_open    = graph_trace_open,
    .close        = graph_trace_close,
    .pipe_close    = graph_trace_close,
    .init        = graph_trace_init,
    .reset        = graph_trace_reset,
    .print_line    = print_graph_function,
    .print_header    = print_graph_headers,
    .flags        = &tracer_flags,
    .set_flag    = func_graph_set_flag,
#ifdef CONFIG_FTRACE_SELFTEST
    .selftest    = trace_selftest_startup_function_graph,
#endif
};

static const struct file_operations graph_depth_fops = {
    .open        = tracing_open_generic,
    .write        = graph_depth_write,
    .read        = graph_depth_read,
    .llseek        = generic_file_llseek,
};

static __init int init_graph_debugfs(void)
{
    struct dentry *d_tracer;

    d_tracer = tracing_init_dentry();
    if (IS_ERR(d_tracer))
        return 0;

    trace_create_file("max_graph_depth", 0644, d_tracer,
              NULL, &graph_depth_fops);

    return 0;
}
fs_initcall(init_graph_debugfs);

static __init int init_graph_trace(void)
{
    max_bytes_for_cpu = snprintf(NULL, 0, "%d", nr_cpu_ids - 1);

    if (!register_ftrace_event(&graph_trace_entry_event)) {
        pr_warning("Warning: could not register graph trace events\n");
        return 1;
    }

    if (!register_ftrace_event(&graph_trace_ret_event)) {
        pr_warning("Warning: could not register graph trace events\n");
        return 1;
    }

    return register_tracer(&graph_trace);--------------------------------------注册function_graph跟踪器
}

core_initcall(init_graph_trace);
```





##  2.5 irqoff/preemptoff/preemptirqoff跟踪器



irqoff/preemptoff/preemptirqoff：注册irqsoff、preemptoff、preemptirqsoff三个跟踪器。

```
core_initcall(init_irqsoff_tracer);
```

##  2.6 wakeup跟踪器

注册wakeup、wakeup_rt、wakeup_dl三个跟踪器。

```
core_initcall(init_wakeup_tracer);
```

## 2.7 mmiotrace跟踪器

mmiotrace：注册mmiotrace跟踪器

```
device_initcall(init_mmio_trace);
```

##  2.8 branch跟踪器



branch：注册branch跟踪器，和branch_annotated、branch_all两个统计信息跟踪器。

```
core_initcall(init_branch_tracer);
fs_initcall(init_annotated_branch_stats);
fs_initcall(all_annotated_branch_stats);
```

##  2.9 blk跟踪器

blk：注册blk跟踪器。

```
device_initcall(init_blk_tracer);
```



 trace_printk：

```
fs_initcall(init_trace_printk_function_export);
early_initcall(init_trace_printk);
```





 stack_trace：

```
device_initcall(stack_trace_init);
```



kprobe/upbobe：

```
fs_initcall(init_kprobe_trace);
fs_initcall(init_uprobe_trace);
```



# 3. 主要代码分析

## 3.1 内核模块初始化顺序

内核中不同功能需要有序初始化，但是相同等级的顺序是没有保证的。

Linux ftrace相关的模块众多，使用了不同等级的initcall。

从下面的定义可以看出他们在内核启动时的调用顺序，模块等级在include/linux/init.h中定义：



```
#define __define_initcall(level,fn,id) \
    static initcall_t __initcall_##fn##id __used \
    __attribute__((__section__(".initcall" level ".init"))) = fn

/*
 * Early initcalls run before initializing SMP.
 *
 * Only for built-in code, not modules.
 */
#define early_initcall(fn)        __define_initcall("early",fn,early)--------------------所谓的early就是在初始化SMP之前调用

/*
 * A "pure" initcall has no dependencies on anything else, and purely
 * initializes variables that couldn't be statically initialized.
 *
 * This only exists for built-in code, not for modules.
 */
#define pure_initcall(fn)        __define_initcall("0",fn,0)

#define core_initcall(fn)        __define_initcall("1",fn,1)
#define core_initcall_sync(fn)        __define_initcall("1s",fn,1s)
#define postcore_initcall(fn)        __define_initcall("2",fn,2)
#define postcore_initcall_sync(fn)    __define_initcall("2s",fn,2s)
#define arch_initcall(fn)        __define_initcall("3",fn,3)
#define arch_initcall_sync(fn)        __define_initcall("3s",fn,3s)
#define subsys_initcall(fn)        __define_initcall("4",fn,4)
#define subsys_initcall_sync(fn)    __define_initcall("4s",fn,4s)
#define fs_initcall(fn)            __define_initcall("5",fn,5)
#define fs_initcall_sync(fn)        __define_initcall("5s",fn,5s)
#define rootfs_initcall(fn)        __define_initcall("rootfs",fn,rootfs)
#define device_initcall(fn)        __define_initcall("6",fn,6)----------------------------对应module_init
#define device_initcall_sync(fn)    __define_initcall("6s",fn,6s)
#define late_initcall(fn)        __define_initcall("7",fn,7)
#define late_initcall_sync(fn)        __define_initcall("7s",fn,7s)
```





## 3.2 ftrace初始化



## 3.3 RingBuffer

##  

# 4. ftrace的配置和使用

/sys/kernel/debug/tracing目录下提供了ftrace的设置和属性接口，对ftrace的配置可以通过echo。了解每个文件的作用和如何设置对于理解整个ftrace框架很有作用。

下面是Ubuntu 16.04+Kernel 4.10.0-42-generic的/sys/kernel/debug/tracing目录：



```
README------------------------一个简单的关于Tracepoing的HOWTO，cat读取，echo设置。

通用配置：
available_tracers-------------当前编译及内核的跟踪器列表，current_tracer必须是这里面支持的跟踪器。
current_tracer----------------用于设置或者显示当前使用的跟踪器列表。系统启动缺省值为nop，使用echo将跟踪器名字写入即可打开。可以通过写入nop重置跟踪器。
buffer_size_kb----------------用于设置单个CPU所使用的跟踪缓存的大小。跟踪缓存为RingBuffer形式，如果跟踪太多，旧的信息会被新的跟踪信息覆盖掉。需要先将current_trace设置为nop才可以。
buffer_total_size_kb----------显示所有的跟踪缓存大小，不同之处在于buffer_size_kb是单个CPU的，buffer_total_size_kb是所有CPU的和。

free_buffer-------------------此文件用于在一个进程被关闭后，同时释放RingBuffer内存，并将调整大小到最小值。
hwlat_detector/
instances/--------------------创建不同的trace buffer实例，可以在不同的trace buffers中分开记录。
tracing_cpumask---------------可以通过此文件设置允许跟踪特定CPU，二进制格式。
per_cpu-----------------------CPU相关的trace信息，包括stats、trace、trace_pipe和trace_pipe_raw。
　　　　　　　　　　　　　　　　　　stats：当前CPU的trace统计信息
　　　　　　　　　　　　　　　　　　trace：当前CPU的trace文件。
　　　　　　　　　　　　　　　　　　trace_pipe：当前CPU的trace_pipe文件。
printk_formats----------------提供给工具读取原始格式trace的文件。
saved_cmdlines----------------存放pid对应的comm名称作为ftrace的cache，这样ftrace中不光能显示pid还能显示comm。
saved_cmdlines_size-----------saved_cmdlines的数目
snapshot----------------------是对trace的snapshot。
                              echo 0清空缓存，并释放对应内存。
                              echo 1进行对当前trace进行snapshot，如没有内存则分配。
                              echo 2清空缓存，不释放也不分配内存。
trace-------------------------查看获取到的跟踪信息的接口，echo > trace可以清空当前RingBuffer。
trace_pipe--------------------输出和trace一样的内容，但是此文件输出Trace同时将RingBuffer中的内容删除，这样就避免了RingBuffer的溢出。可以通过cat trace_pipe > trace.txt &保存文件。
trace_clock-------------------显示当前Trace的timestamp所基于的时钟，默认使用local时钟。local：默认时钟；可能无法在不同CPU间同步；global：不同CUP间同步，但是可能比local慢；counter：这是一个跨CPU计数器，需要分析不同CPU间event顺序比较有效。
trace_marker------------------从用户空间写入标记到trace中，用于用户空间行为和内核时间同步。
trace_marker_raw--------------以二进制格式写入到trace中。
trace_options-----------------控制Trace打印内容或者操作跟踪器，可以通过trace_options添加很多附加信息。
options-----------------------trace选项的一系列文件，和trace_options对应。
trace_stat/-------------------每个CPU的Trace统计信息
tracing_max_latency-----------记录Tracer的最大延时，
tracing_on--------------------用于控制跟踪打开或停止，0停止跟踪，1继续跟踪。
tracing_thresh----------------延时记录Trace的阈值，当延时超过此值时才开始记录Trace。单位是ms，只有非0才起作用。

Events配置：
available_events--------------列出系统中所有可用的Trace events，分两个层级，用冒号隔开。
events/-----------------------系统Trace events目录，在每个events下面都有enable、filter和fotmat。enable是开关；format是events的格式，然后根据格式设置 filter。
set_event---------------------将Trace events名称直接写入set_event就可以打开。
set_event_pid-----------------指定追踪特定进程的events。

Function配置：
available_filter_functions----记录了当前可以跟踪的内核函数，不在该文件中列出的函数，无法跟踪其活动。
dyn_ftrace_total_info---------显示available_filter_functins中跟中函数的数目，两者一致。
enabled_functions-------------显示有回调附着的函数名称。
function_profile_enabled------打开此选项，在trace_stat中就会显示function的统计信息。
set_ftrace_filter-------------用于显示指定要跟踪的函数
set_ftrace_notrace------------用于指定不跟踪的函数，缺省为空。
set_ftrace_pid----------------用于指定要追踪特定进程的函数。

Function graph配置：
max_graph_depth---------------函数嵌套的最大深度。
set_graph_function------------设置要清晰显示调用关系的函数，在使用function_graph跟踪器是使用，缺省对所有函数都生成调用关系。
set_graph_notrace-------------不跟踪特定的函数嵌套调用。

Stack trace设置：
stack_max_size----------------当使用stack跟踪器时，记录产生过的最大stack size
stack_trace-------------------显示stack的back trace
stack_trace_filter------------设置stack tracer不检查的函数名称

Kernel dynamic events:
kprobe_events
kprobe_profile

Userspace dynamic events:
uprobe_events
uprobe_profile
```







## 4.1 通用配置

### 使能和配置大小

常用的配置有对Trace的开关(tracing_on)

> echo 0/1 > /sys/kernel/debug/tracing/tracing_on

设置RingBuffer大小(buffer_size_kb),同时buffer_total_size_kb就变成NR_CPUS的倍数。

### **trace、trace_pipe和snapshot的区别？**

trace是从RingBuffer中取出内容，trace_pipe会一直读取Buffer流。

snapshot是trace的一个瞬间快照：

> echo 0 > snapshot : Clears and frees snapshot buffer
> echo 1 > snapshot : Allocates snapshot buffer, if not already allocated.
>            Takes a snapshot of the main buffer.
> echo 2 > snapshot : Clears snapshot buffer (but does not allocate or free)
>            (Doesn't have to be '2' works with any number that
>             is not a '0' or '1')

### **Tracer**

从available_tracers可以获取系统支持的Tracer,current_tracer是当前使用中的Tracer。

Events只有在nop tracer下才会起作用，同时多个tracer不能共享。同一时候只能一个Tracer在生效。

> cat available_tracers
>
> *hwlat blk mmiotrace function_graph wakeup_dl wakeup_rt wakeup function nop*
>
> echo function > current_tracer



### **instances**

在instances目录下，可以通过mkdir创建instance，rmdir删除instance。

新目录下，有很多类似tracing下的文件，可以对其进行配置。然后读取专有的trace/trace_pipe。

> mkdir foo
>
> ls foo
>
> *available_tracers   options       set_ftrace_pid  trace_options
> buffer_size_kb    per_cpu       snapshot     trace_pipe
> buffer_total_size_kb set_event      trace       tracing_cpumask
> current_tracer    set_event_pid    trace_clock    tracing_max_latency
> events        set_ftrace_filter  trace_marker   tracing_on
> free_buffer      set_ftrace_notrace trace_marker_raw*
>
> rmdir foo

### 特定CPU信息

抓取特定CPU信息0~3：

> echo f > tracing_cpumask

查看特定CPU信息：

> cat per_cpu/cpu3/trace



### 用户空间插入Trace标记

有时候需要往Trace中插入标记，trace_marker/trace_marker_raw提供了这样功能。

> echo CAPTURE_START > trace_marker
>
> echo CAPTURE_START > trace_marker_raw

### Trace选项设置

通过options内容设置，对Trace的输出进行定制，控制输出大小。

trace_option是options设置的结果，可以看出开了哪些选项，关闭了哪些选项。

> echo 0/1 > options/irq-info



## 4.2 Tracepoint

可以对系统特定事件进行跟踪，在available_events可以找到所有事件。然后将需要的时间通过echo xxx >> set_event写入。也可以通过events目录来打开。

### 4.2.1 Trace Events生效条件

在current_tracer为nop，然后设置tracing/events下面的enable，即可通过tracing/trace或者tracing/trace_pipe查看内容。

### 4.2.2 Trace Events的过滤功能？

#### 对特定Events的过滤，只打开需要监控的Events。

如果要禁用某个时间在事件前加上！，如echo "!sys_enter_nic" >> set_event。

> echo net >set_event--------------------------------打开所有net目录下的事件
>
> echo skb >>set_event------------------------------附加设置skb到目录下

过滤的表达式是：field-name relational-operator value，多表达式可以通过逻辑运算符&&或者||来组合。

数字可以通过==、！=、>、<、&&、||等等来组合filter，来过滤掉很多不需要信息。

文字可以通过==、!=、~l来组合filter。

如针对timer_start事件的Trace：



```
# tracer: nop
#
# entries-in-buffer/entries-written: 327/327   #P:4
#
#                              _-----=> irqs-off
#                             / _----=> need-resched
#                            | / _---=> hardirq/softirq
#                            || / _--=> preempt-depth
#                            ||| /     delay
#           TASK-PID   CPU#  ||||    TIMESTAMP  FUNCTION
#              | |       |   ||||       |         |
            Xorg-1684  [000] d... 1140567.102754: timer_start: timer=ffff8800b20300f0 function=intel_uncore_fw_release_timer [i915] expires=4579967822 [timeout=1] flags=0x00000001
      nxnode.bin-11900 [000] d.s. 1140567.105061: timer_start: timer=ffff8803aa293508 function=intel_pstate_timer_func expires=4579967825 [timeout=3] flags=0x00100000
          <idle>-0     [000] dNs. 1140567.108404: timer_start: timer=ffff8802cf845698 function=tcp_delack_timer expires=4579967832 [timeout=10] flags=0x00000000
```



在events目录下，有很多子目录。这些目录里面可以使用filter，过滤很多不需要的信息。

通过format可以知道，timer_start这个时间的field名称，然后在filter进行设置。

#### 针对某一pid进行过滤。

将对应pid写入set_event_pid，就可达到只监控某个进程的Events。

#### 清空跟踪器

对子系统的filter写入0，即可清空整个子系统的filter

echo 0 > filter

### 4.2.3 Events的trigger功能

enable_event/disable_event

stacktrace

snapshot

traceon/traceoff

## 4.3 如何在Linux command line启动Events



## 4.3 function跟踪器及动态ftrace

function跟踪器可以用于跟踪内核函数的调用情况，用于调试分析bug或者了解内核运行过程。

### 4.3.1 打开Function跟踪器

> echo function > /sys/kernel/debug/tracing/current_tracer

### 4.3.2 在trace_stat中显示function的统计信息

#### 4.3.2.1 trace_stat的使用

trace_stat/function0在系统初始化就创建，通过function_profile_enabled进行开关。

统计的函数在set_ftrace_filter和set_ftrace_notrace中设置。

> echo 0/1 > function_profile_enabled

在使能function优化功能之后，可以查看不同CPU下每个函数执行时间统计信息。

每列表示的内容分别是：函数名称、调用次数、总耗时、平均耗时、耗时均方差。

> cat trace_stat/function0
>
> *Function                Hit  Time      Avg       s^2
>   --------                ---  ----      ---       ---
>   schedule               65154  1721953948 us   26428.98 us   940990.8 us
>   schedule_hrtimeout_range       9655  920051856 us   95292.78 us   1284647 us
>   schedule_hrtimeout_range_clock    9655  920046552 us   95292.23 us   1139416 us
>   poll_schedule_timeout         5562  768940036 us   138248.8 us   13748771 us
>   do_sys_poll              9188  485558063 us   52846.98 us   6242561 us
>   SyS_poll               8419  469986128 us   55824.45 us   6183267 us
>   core_sys_select            1853  283704721 us   153105.6 us   2109401 us
>   do_select               1853  283689546 us   153097.4 us   3187699 us
>   SyS_futex              40313  260910692 us   6472.122 us   8796046 us
>   do_futex               40313  260888660 us   6471.576 us   8397810 us
>   futex_wait              18824  260325650 us   13829.45 us   4756645 us*
>
>  



#### 4.3.2.2 通用tracer_stat注册register_stat_tracer()

register_stat_tracer()->init_stat_file()->



```
static const struct file_operations tracing_stat_fops = {
    .open        = tracing_stat_open,
    .read        = seq_read,
    .llseek        = seq_lseek,
    .release    = tracing_stat_release
};


static int init_stat_file(struct stat_session *session)
{
    if (!stat_dir && tracing_stat_init())
        return -ENODEV;

    session->file = debugfs_create_file(session->ts->name, 0644,
                        stat_dir,
                        session, &tracing_stat_fops);
...
}

static int tracing_stat_open(struct inode *inode, struct file *file)
{
...
    ret = stat_seq_init(session);
    if (ret)
        return ret;

    ret = seq_open(file, &trace_stat_seq_ops);
...
}

static const struct seq_operations trace_stat_seq_ops = {
    .start        = stat_seq_start,
    .next        = stat_seq_next,
    .stop        = stat_seq_stop,
    .show        = stat_seq_show
};

static int stat_seq_show(struct seq_file *s, void *v)
{
...
    return session->ts->stat_show(s, l->stat);
}
```







#### 4.3.2.3 function trace_stat流程

trace_stat/function0相关代码流程如下：

ftrace_init_debugfs()->ftrace_profile_debugfs()->register_stat_tracer()



```
static const struct file_operations ftrace_profile_fops = {
    .open        = tracing_open_generic,
    .read        = ftrace_profile_read,
    .write        = ftrace_profile_write,
    .llseek        = default_llseek,
};

/* used to initialize the real stat files */
static struct tracer_stat function_stats __initdata = {
    .name        = "functions",
    .stat_start    = function_stat_start,
    .stat_next    = function_stat_next,
    .stat_cmp    = function_stat_cmp,
    .stat_headers    = function_stat_headers,
    .stat_show    = function_stat_show
};

static __init void ftrace_profile_debugfs(struct dentry *d_tracer)
{
    struct ftrace_profile_stat *stat;
    struct dentry *entry;
    char *name;
    int ret;
    int cpu;

    for_each_possible_cpu(cpu) {
        stat = &per_cpu(ftrace_profile_stats, cpu);

        /* allocate enough for function name + cpu number */
        name = kmalloc(32, GFP_KERNEL);
...
        stat->stat = function_stats;
        snprintf(name, 32, "function%d", cpu);----------------------会在trace_stat目录下创建function0节点，0表示CPU序号。
        stat->stat.name = name;
        ret = register_stat_tracer(&stat->stat);--------------------注册function_stats
...
    }

    entry = debugfs_create_file("function_profile_enabled", 0644,
                    d_tracer, NULL, &ftrace_profile_fops);----------创建function_profile_enabled节点，函数集为ftrace_profile_fops
...
}
```







写function_profile_enabled触发代码流程：



```
static ssize_t
ftrace_profile_write(struct file *filp, const char __user *ubuf,
             size_t cnt, loff_t *ppos)
{
    unsigned long val;
    int ret;

    ret = kstrtoul_from_user(ubuf, cnt, 10, &val);
    if (ret)
        return ret;

    val = !!val;

    mutex_lock(&ftrace_profile_lock);
    if (ftrace_profile_enabled ^ val) {
        if (val) {
            ret = ftrace_profile_init();
            if (ret < 0) {
                cnt = ret;
                goto out;
            }

            ret = register_ftrace_profiler();
            if (ret < 0) {
                cnt = ret;
                goto out;
            }
            ftrace_profile_enabled = 1;
        } else {
            ftrace_profile_enabled = 0;
            /*
             * unregister_ftrace_profiler calls stop_machine
             * so this acts like an synchronize_sched.
             */
            unregister_ftrace_profiler();
        }
    }
 out:
    mutex_unlock(&ftrace_profile_lock);

    *ppos += cnt;

    return cnt;
}

static int register_ftrace_profiler(void)
{
    return register_ftrace_graph(&profile_graph_return,
                     &profile_graph_entry);
}

static void unregister_ftrace_profiler(void)
{
    unregister_ftrace_graph();
}
```









显示profile结果



```
static int function_stat_show(struct seq_file *m, void *v)
{
    struct ftrace_profile *rec = v;
    char str[KSYM_SYMBOL_LEN];
    int ret = 0;
#ifdef CONFIG_FUNCTION_GRAPH_TRACER
    static struct trace_seq s;
    unsigned long long avg;
    unsigned long long stddev;
#endif
    mutex_lock(&ftrace_profile_lock);

    /* we raced with function_profile_reset() */
    if (unlikely(rec->counter == 0)) {
        ret = -EBUSY;
        goto out;
    }

    kallsyms_lookup(rec->ip, NULL, NULL, NULL, str);
    seq_printf(m, "  %-30.30s  %10lu", str, rec->counter);

#ifdef CONFIG_FUNCTION_GRAPH_TRACER
    seq_printf(m, "    ");
    avg = rec->time;
    do_div(avg, rec->counter);

    /* Sample standard deviation (s^2) */
    if (rec->counter <= 1)
        stddev = 0;
    else {
        stddev = rec->time_squared - rec->counter * avg * avg;
        /*
         * Divide only 1000 for ns^2 -> us^2 conversion.
         * trace_print_graph_duration will divide 1000 again.
         */
        do_div(stddev, (rec->counter - 1) * 1000);
    }

    trace_seq_init(&s);
    trace_print_graph_duration(rec->time, &s);
    trace_seq_puts(&s, "    ");
    trace_print_graph_duration(avg, &s);
    trace_seq_puts(&s, "    ");
    trace_print_graph_duration(stddev, &s);
    trace_print_seq(m, &s);
#endif
    seq_putc(m, '\n');
out:
    mutex_unlock(&ftrace_profile_lock);

    return ret;
}
```











### 4.3.3 function跟踪器的过滤器

在打开CONFIG_DYNAMIC_FTRACE的情况下，增加一些动态跟踪功能，比如available_filter_functions、set_ftrace_filter、set_ftrace_notrace。

#### 4.3.3.1 set_ftrace_filter跟踪某些函数



```
1. 默认情况下set_ftrace_filter是全部函数都开的。
   cat set_ftrace_filter如下：
   #### all functions enabled ####

2. 如果想只监控某些函数，通过echo mod_timer add_timer > set_ftrace_filter即可。
   cat set_ftrace_filter如下：
   mod_timer
   add_timer   如果要附加function，通过echo xxx >> set_ftrace_filter即可。3. 使用通配符*　　echo "sched*" > set_ftrace_filter----------------选择所有以sched开头的函数　　echo "*sched*" > set_ftrace_filter---------------选择所有包含sched的函数　　echo "*sched" > set_ftrace_filter----------------选择所有以sched结尾的函数
4. 如果想恢复全开，只需要echo > set_ftrace_filter，即清空filter。
```



#### 4.3.3.2 set_ftrace_notrace指定不跟踪哪个函数

echo xxx > set_ftrace_notrace

#### 4.3.3.3 set_ftrace_pid只跟踪某一个进程

echo xxx > set_ftrace_pid



通过cat trace可以得到结果，只提供了trace函数的调用者。



```
# tracer: function
#
# entries-in-buffer/entries-written: 5/5   #P:1
#
#                              _-----=> irqs-off
#                             / _----=> need-resched
#                            | / _---=> hardirq/softirq
#                            || / _--=> preempt-depth
#                            ||| /     delay
#           TASK-PID   CPU#  ||||    TIMESTAMP  FUNCTION
#              | |       |   ||||       |         |
            adbd-1243  [000] d...  7436.183990: mod_timer <-DWC_TIMER_SCHEDULE
          <idle>-0     [000] ..s.  7437.264984: mod_timer <-br_hello_timer_expired
            adbd-1243  [000] d...  7438.000336: mod_timer <-DWC_TIMER_SCHEDULE
            adbd-1243  [000] d...  7438.000549: mod_timer <-DWC_TIMER_SCHEDULE
            adbd-1243  [000] d...  7438.003876: mod_timer <-DWC_TIMER_SCHEDULE
```



###  

###  4.3.4 都有哪些函数可以跟踪(available_filter_functions)?





ftrace_init初始化：





```
extern unsigned long __start_mcount_loc[];
extern unsigned long __stop_mcount_loc[];

void __init ftrace_init(void)
{
    unsigned long count, addr, flags;
    int ret;

    /* Keep the ftrace pointer to the stub */
    addr = (unsigned long)ftrace_stub;

    local_irq_save(flags);
    ftrace_dyn_arch_init(&addr);
    local_irq_restore(flags);

    /* ftrace_dyn_arch_init places the return code in addr */
    if (addr)
        goto failed;

    count = __stop_mcount_loc - __start_mcount_loc;

    ret = ftrace_dyn_table_alloc(count);
    if (ret)
        goto failed;

    last_ftrace_enabled = ftrace_enabled = 1;

    ret = ftrace_process_locs(NULL,
                  __start_mcount_loc,
                  __stop_mcount_loc);

    ret = register_module_notifier(&ftrace_module_exit_nb);
    if (ret)
        pr_warning("Failed to register trace ftrace module exit notifier\n");

    set_ftrace_early_filters();

    return;
 failed:
    ftrace_disabled = 1;
}

static int ftrace_process_locs(struct module *mod,
                   unsigned long *start,
                   unsigned long *end)
{
    struct ftrace_page *pg;
    unsigned long count;
    unsigned long *p;
    unsigned long addr;
    unsigned long flags = 0; /* Shut up gcc */
    int ret = -ENOMEM;

    count = end - start;

    if (!count)
        return 0;

    pg = ftrace_allocate_pages(count);
    if (!pg)
        return -ENOMEM;

    mutex_lock(&ftrace_lock);

    /*
     * Core and each module needs their own pages, as
     * modules will free them when they are removed.
     * Force a new page to be allocated for modules.
     */
    if (!mod) {
        WARN_ON(ftrace_pages || ftrace_pages_start);
        /* First initialization */
        ftrace_pages = ftrace_pages_start = pg;
    } else {
        if (!ftrace_pages)
            goto out;

        if (WARN_ON(ftrace_pages->next)) {
            /* Hmm, we have free pages? */
            while (ftrace_pages->next)
                ftrace_pages = ftrace_pages->next;
        }

        ftrace_pages->next = pg;
        ftrace_pages = pg;
    }

    p = start;
    while (p < end) {
        addr = ftrace_call_adjust(*p++);
        /*
         * Some architecture linkers will pad between
         * the different mcount_loc sections of different
         * object files to satisfy alignments.
         * Skip any NULL pointers.
         */
        if (!addr)
            continue;
        if (!ftrace_record_ip(addr))
            break;
    }

    /* These new locations need to be initialized */
    ftrace_new_pgs = pg;

    /* Make each individual set of pages sorted by ips */
    for (; pg; pg = pg->next)
        sort(pg->records, pg->index, sizeof(struct dyn_ftrace),
             ftrace_cmp_recs, ftrace_swap_recs);

    /*
     * We only need to disable interrupts on start up
     * because we are modifying code that an interrupt
     * may execute, and the modification is not atomic.
     * But for modules, nothing runs the code we modify
     * until we are finished with it, and there's no
     * reason to cause large interrupt latencies while we do it.
     */
    if (!mod)
        local_irq_save(flags);
    ftrace_update_code(mod);
    if (!mod)
        local_irq_restore(flags);
    ret = 0;
 out:
    mutex_unlock(&ftrace_lock);

    return ret;
}
```













```
static __init int ftrace_init_dyn_debugfs(struct dentry *d_tracer)
{

    trace_create_file("available_filter_functions", 0444,
            d_tracer, NULL, &ftrace_avail_fops);

    trace_create_file("enabled_functions", 0444,
            d_tracer, NULL, &ftrace_enabled_fops);

    trace_create_file("set_ftrace_filter", 0644, d_tracer,
            NULL, &ftrace_filter_fops);

    trace_create_file("set_ftrace_notrace", 0644, d_tracer,
                    NULL, &ftrace_notrace_fops);

#ifdef CONFIG_FUNCTION_GRAPH_TRACER
    trace_create_file("set_graph_function", 0444, d_tracer,
                    NULL,
                    &ftrace_graph_fops);
#endif /* CONFIG_FUNCTION_GRAPH_TRACER */

    return 0;
}

static const struct file_operations ftrace_avail_fops = {
    .open = ftrace_avail_open,
    .read = seq_read,
    .llseek = seq_lseek,
    .release = seq_release_private,
};



static int
ftrace_avail_open(struct inode *inode, struct file *file)
{
    struct ftrace_iterator *iter;
    int ret;

    if (unlikely(ftrace_disabled))
        return -ENODEV;

    iter = kzalloc(sizeof(*iter), GFP_KERNEL);
    if (!iter)
        return -ENOMEM;

    iter->pg = ftrace_pages_start;
    iter->ops = &global_ops;

    ret = seq_open(file, &show_ftrace_seq_ops);
    if (!ret) {
        struct seq_file *m = file->private_data;

        m->private = iter;
    } else {
        kfree(iter);
    }

    return ret;
}
```











## 4.4 function_graph跟踪器

function_graph和function类似，但是function跟踪器只在函数入口点探测，而function_graph在函数入口和退出都进行探测。

function_graph提供了类似C语言函数调用关系图，并且记录了函数执行耗时。

> echo function_graph > /sys/kernel/debug/tracing/current_tracer。

function_graph没有设置pid，但是可以设置跟踪哪些函数，不跟踪那些函数：

> echo xxx > set_graph_function
>
> echo xxx > set_graph_notrace

设置function_graph嵌套层数：

> echo 10 > max_graph_depth

获得的Trace如下，细节以及调用关系更明确。同时可以获得函数耗时，这对于性能优化非常重要，可以轻松找出热点区域。



```
 0)               |  SyS_futex() {
 0)               |    do_futex() {
 0)               |      futex_wake() {
 0)               |        get_futex_key() {
 0)   0.045 us    |          get_futex_key_refs.isra.13();
 0)   0.337 us    |        }
 0)   0.040 us    |        hash_futex();
 0)   0.051 us    |        _raw_spin_lock();
 0)               |        mark_wake_futex() {
 0)   0.061 us    |          wake_q_add();
 0)   0.082 us    |          __unqueue_futex();
 0)   0.674 us    |        }
 0)               |        wake_up_q() {
...
 0) + 14.680 us   |        }
 0)   0.033 us    |        drop_futex_key_refs.isra.14();
 0) + 17.200 us   |      }
 0) + 17.495 us   |    }
 0) + 17.752 us   |  }
```



抓取数据之后，可以通过Python脚本进行简单的转换放到SourceInsight查看更方便。



```
import re

output_file = 'output.c'

input_file = 'trace.txt'


input = open(input_file, 'rb')
output = open(output_file, 'wb')

for line in input:
    m = re.match('^ (?P<cpu>[0-9]).{3}(?P<duration>.*) *\| (?P<message>.*)', line)
    if(not m):
        continue
    #print m.group('cpu'), m.group('duration'), m.group('message')
    output.write(m.group('message') + "//" + m.group('duration') + "\n")
```





## 4.5 irqsoff/preemptoff/preemptirqsoff跟踪器

### 4.5.1 中断屏蔽和强占禁止带来的危害

中断屏蔽和强占禁止非常影响系统性能，所以对中断屏蔽和强占禁止进行统计监控，发现异常点很有必要。

当中断被屏蔽后，CPU无法响应外部事件(除了不可屏蔽中断NMI和系统管理中断SMI)。这就会阻止比如系统Tick中断或者键盘中断，导致响应时间变长。

同样强占禁止，我们还可以收到中断，但是任务强占被禁止导致更高优先级的任务得不到调度，直到强占被再次允许。

### 4.5.2 设置跟踪器



```
echo 0 > options/function-trace
echo irqsoff > current_tracer
echo 1 > tracing_on
echo 0 > tracing_max_latency
 [...]
echo 0 > tracing_on
cat trace
```





结果如下：



```
# tracer: irqsoff
#
# irqsoff latency trace v1.1.5 on 4.0.0+
# --------------------------------------------------------------------
# latency: 11658 us, #4/4, CPU#2 | (M:server VP:0, KP:0, SP:0 HP:0 #P:4)
#    -----------------
#    | task: swapper/2-0 (uid:0 nice:0 policy:0 rt_prio:0)
#    -----------------
#  => started at: rcu_idle_enter
#  => ended at:   arch_cpu_idle---------------------记录禁止中断时间最长的开始和结束函数
#
#
#                  _------=> CPU#            
#                 / _-----=> irqs-off----------------d表示中断被disabled，'.'表示中断没有被关闭。
#                | / _----=> need-resched------------N-表示need_resched被设置；'.'-表示need_resched没有被设置，中断返回不会进行进程切换。
#                || / _---=> hardirq/softirq---------H-表示softirq中发生了硬件中断；h-硬件中断；s-softirq；'.'-不在中断上下文中。
#                ||| / _--=> preempt-depth-----------当抢占中断势能后，该域代表preempt_disabled的级别。
#                |||| /     delay            
#  cmd     pid   ||||| time  |   caller      ---------cmd-进程名，pid-进程id，time-表示trace从开始到当前的相对时间，delay-突出显示那些有高延迟的地方以便引起注意。！表示需要引起注意。
#     \   /      |||||  \    |   /         
  <idle>-0       2d...    3us#: rcu_idle_enter
  <idle>-0       2d... 11645us+: arch_cpu_idle
  <idle>-0       2d... 11665us+: trace_hardirqs_on <-arch_cpu_idle
  <idle>-0       2d... 11753us : <stack trace>
 => cpu_startup_entry
 => secondary_start_kernel
```





察看禁止中断最长函数：



```
static void cpuidle_idle_call(void)
{
...
    rcu_idle_enter();------------------屏蔽中断
...
    if (current_clr_polling_and_test())
        local_irq_enable();
    else
        arch_cpu_idle();---------------开中断
...
}
```





## 4.6 wakeup/wakeup_rt/wakeup_dl跟踪器

wakeup类调度器记录调度延时，也即从系统被唤醒到被调度到的延时。显示的结果类似irqsoff跟踪器。



```
echo 0 > options/function-trace
echo wakeup > current_tracer
echo 1 > tracing_on
echo 0 > tracing_max_latency
chrt -f 5 sleep 1
echo 0 > tracing_on
cat trace
```







wakeup：显示进程从woken到wake up的延时，包括所有进程。

wakeup_dl：显示SCHED_DEADLINE类型调度延时。

wakeup_rt：显示实时进程的调度延时。

## 4.7 stack跟踪器

stack跟踪器用于追踪内核栈的使用情况，它记录了每个内核对栈的使用情况。

stack跟踪器比较特殊，它的使能不在tracing目录：



```
       Depth    Size   Location    (-1 entries)
        -----    ----   --------
#
#  Stack tracer disabled
#
# To enable the stack tracer, either add 'stacktrace' to the
# kernel command line
# or 'echo 1 > /proc/sys/kernel/stack_tracer_enabled'
#
```



 然后通过/sys/kernel/debug/tracing/stack_trace可以查看堆栈轨迹。



```
        Depth    Size   Location    (13 entries)
        -----    ----   --------
  0)     1952       4   msecs_to_jiffies+0x14/0x34-----------------------一共1952个字节
  1)     1948      76   update_group_capacity+0x2c/0x2b4
  2)     1872     256   find_busiest_group+0x10c/0x904
  3)     1616     168   load_balance+0x170/0x7b0
  4)     1448     104   pick_next_task_fair+0x1a8/0x500
  5)     1344      28   __schedule+0x100/0x5b8
  6)     1316      68   schedule+0x4c/0xa4
  7)     1248     104   schedule_hrtimeout_range_clock+0x154/0x15c
  8)     1144      16   schedule_hrtimeout_range+0x1c/0x20
  9)     1128      24   poll_schedule_timeout+0x48/0x74
 10)     1104     968   do_sys_poll+0x3fc/0x4b8-------------------------使用了最大的栈空间
 11)      136      40   SyS_poll+0xc4/0x108
 12)       96      96   ret_fast_syscall+0x0/0x4c
```









## 4.8 其他Tracer

mmiotrace：Memory mapped IO

blk：



## 4.9 开机使用ftrace

存在某些情况，需要尽量早的启动ftrace功能。

这时候就需要修改command line，在其中打开ftrace相关设置。

具体的设置有trace_event、trace_buf_size、ftrace、ftrace_notrace、ftrace_filter、ftrace_graph_filter、stacktrace、ftraceftrace_dump_on_oops、tracing_thresh。

ftrace用于设置tracer，trace_buf_size设置ring buffer大小，trace_event设置跟踪哪些events，ftrace_notrace/ftrace_filter/ftrace_graph_filter都是设置过滤器。

### 4.9.1 trace_event设置trace events

在开机的时候设置需要跟踪的trace events，将内容放入bootup_event_buf。

通常格式如下，以逗号作为分隔符：

> trace_event=sched:sched_process_fork,irq:,thermal

然后在event_trace_init()中根据bootup_event_buf进行设置。



```
static __init int setup_trace_event(char *str)
{
    strlcpy(bootup_event_buf, str, COMMAND_LINE_SIZE);
    ring_buffer_expanded = 1;
    tracing_selftest_disabled = 1;

    return 1;
}
__setup("trace_event=", setup_trace_event);

static __init int event_trace_init(void)
{
    struct ftrace_event_call **call;
    struct dentry *d_tracer;
    struct dentry *entry;
    struct dentry *d_events;
    int ret;
    char *buf = bootup_event_buf;
    char *token;
...
    while (true) {
        token = strsep(&buf, ",");

        if (!token)
            break;
        if (!*token)
            continue;

        ret = ftrace_set_clr_event(token, 1);
        if (ret)
            pr_warning("Failed to enable trace event: %s\n", token);
    }
...
    return 0;
}
```







### 4.9.2 ftrace相关设置

在command line中设置ftrace可以在开机时启动指定tracer。

指定tracer在register_tracer()中进行。



```
static char bootup_tracer_buf[MAX_TRACER_SIZE] __initdata;
static char *default_bootup_tracer;

static int __init set_cmdline_ftrace(char *str)
{
    strncpy(bootup_tracer_buf, str, MAX_TRACER_SIZE);
    default_bootup_tracer = bootup_tracer_buf;------------------------------------------指定tracer的名称
    /* We are using ftrace early, expand it */
    ring_buffer_expanded = 1;
    return 1;
}
__setup("ftrace=", set_cmdline_ftrace);

int register_tracer(struct tracer *type)
__releases(kernel_lock)
__acquires(kernel_lock)
{
    struct tracer *t;
    int ret = 0;
...
 out:
    tracing_selftest_running = false;
    mutex_unlock(&trace_types_lock);

    if (ret || !default_bootup_tracer)
        goto out_unlock;

    if (strncmp(default_bootup_tracer, type->name, MAX_TRACER_SIZE))--------------------比较当前注册的tracer是否和ftrace设置的。
        goto out_unlock;

    printk(KERN_INFO "Starting tracer '%s'\n", type->name);
    /* Do we want this tracer to start on bootup? */
    tracing_set_tracer(type->name);------------------------------------------------------在注册的时候就指定tracer。
    default_bootup_tracer = NULL;
    /* disable other selftests, since this will break it. */
    tracing_selftest_disabled = 1;
#ifdef CONFIG_FTRACE_STARTUP_TEST
    printk(KERN_INFO "Disabling FTRACE selftests due to running tracer '%s'\n",
           type->name);
#endif

 out_unlock:
    return ret;
}
```









# 5 ftrace相关工具

## 5.1 trace-cmd和kernelshark

请参照：《[ftrace利器之trace-cmd和kernelshark](https://www.cnblogs.com/arnoldlu/p/9014365.html)》。

# 6 ftrace实现的原理

打开对function、function_graph的支持，导致在编译时插入的一段代码。

然后在echo function/function_graph > current_tracer，在运行时将代码进行替换的操作。

详细解释编译、动态开关等ftrace相关原理和流程。

《[ftrace function_graph分析](http://blog.chinaunix.net/uid-23141914-id-5603238.html)》

## 6.0 GCC -pg选项

对比打开-pg和不打开汇编代码，查看区别，以cpu_down为例。分别查看不同选项下的反汇编。

| **未开function/function_graph tracer**                       | **仅开function tracer**                                      | **开function/function_graph tracer**                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 0000038c <cpu_down>: 38c: e92d4010 push {r4, lr} 390: e1a04000 mov r4, r0 394: e3000000 movw r0, #0 398: e3400000 movt r0, #0 39c: ebfffffe bl 0 <mutex_lock> 3a0: e3003000 movw r3, #0 3a4: e3403000 movt r3, #0 3a8: e5931004 ldr r1, [r3, #4] 3ac: e3510000 cmp r1, #0 3b0: 1a000007 bne 3d4 <cpu_down+0x48> 3b4: e1a00004 mov r0, r4 3b8: ebffff43 bl cc <_cpu_down> 3bc: e1a04000 mov r4, r0 3c0: e3000000 movw r0, #0 3c4: e3400000 movt r0, #0 3c8: ebfffffe bl 0 <mutex_unlock> 3cc: e1a00004 mov r0, r4 3d0: e8bd8010 pop {r4, pc} 3d4: e3e0400f mvn r4, #15 3d8: eafffff8 b 3c0 <cpu_down+0x34> | 000003c0 <cpu_down>: 3c0: e92d4010 push {r4, lr} 3c4: e52de004 push {lr} ; (str lr, [sp, #-4]!) 3c8: ebfffffe bl 0 <__gnu_mcount_nc> 3cc: e1a04000 mov r4, r0 3d0: e3000000 movw r0, #0 3d4: e3400000 movt r0, #0 3d8: ebfffffe bl 0 <mutex_lock> 3dc: e3003000 movw r3, #0 3e0: e3403000 movt r3, #0 3e4: e5931004 ldr r1, [r3, #4] 3e8: e3510000 cmp r1, #0 3ec: 1a000007 bne 410 <cpu_down+0x50> 3f0: e1a00004 mov r0, r4 3f4: ebffff3e bl f4 <_cpu_down> 3f8: e1a04000 mov r4, r0 3fc: e3000000 movw r0, #0 400: e3400000 movt r0, #0 404: ebfffffe bl 0 <mutex_unlock> 408: e1a00004 mov r0, r4 40c: e8bd8010 pop {r4, pc} 410: e3e0400f mvn r4, #15 414: eafffff8 b 3fc <cpu_down+0x3c> | 00000400 <cpu_down>: 400: e1a0c00d mov ip, sp 404: e92dd830 push {r4, r5, fp, ip, lr, pc} 408: e24cb004 sub fp, ip, #4 40c: e52de004 push {lr} ; (str lr, [sp, #-4]!) 410: ebfffffe bl 0 <__gnu_mcount_nc> 414: e1a04000 mov r4, r0 418: e3000000 movw r0, #0 41c: e3400000 movt r0, #0 420: ebfffffe bl 0 <mutex_lock> 424: e3003000 movw r3, #0 428: e3403000 movt r3, #0 42c: e5931004 ldr r1, [r3, #4] 430: e3510000 cmp r1, #0 434: 1a000007 bne 458 <cpu_down+0x58> 438: e1a00004 mov r0, r4 43c: ebffff3a bl 12c <_cpu_down> 440: e1a04000 mov r4, r0 444: e3000000 movw r0, #0 448: e3400000 movt r0, #0 44c: ebfffffe bl 0 <mutex_unlock> 450: e1a00004 mov r0, r4 454: e89da830 ldm sp, {r4, r5, fp, sp, pc} 458: e3e0400f mvn r4, #15 45c: eafffff8 b 444 <cpu_down+0x44> |

 __gnu_mcount_nc定义如下：



```
ENTRY(__gnu_mcount_nc)
#ifdef CONFIG_DYNAMIC_FTRACE
    mov    ip, lr
    ldmia    sp!, {lr}
    mov    pc, ip
#else
    __mcount
#endif
ENDPROC(__gnu_mcount_nc)
```







## 6.1 打开哪些选项才能实现ftrace功能？

可以看出在定义了CONFIG_FUNCTION_TRACER、CONFIG_DYNAMIC_FTRACE之后就具备了recordmcount的功能。

如果再定义CONFIG_HAVE_C_RECORDMCOUNT，那么就会使用recordmcount.c而不是recordmcount.pl来进行mcount处理。

.config中定义：

```

CONFIG_FUNCTION_TRACER=y
CONFIG_HAVE_C_RECORDMCOUNT=y
CONFIG_DYNAMIC_FTRACE=y
CONFIG_FTRACE_MCOUNT_RECORD=y
```

 Makefile中定义：



```
ifdef CONFIG_FUNCTION_TRACER
ifndef CC_FLAGS_FTRACE
CC_FLAGS_FTRACE := -pg
endif
export CC_FLAGS_FTRACE
ifdef CONFIG_HAVE_FENTRY
CC_USING_FENTRY    := $(call cc-option, -mfentry -DCC_USING_FENTRY)
endif
KBUILD_CFLAGS    += $(CC_FLAGS_FTRACE) $(CC_USING_FENTRY)
KBUILD_AFLAGS    += $(CC_USING_FENTRY)
ifdef CONFIG_DYNAMIC_FTRACE
    ifdef CONFIG_HAVE_C_RECORDMCOUNT
        BUILD_C_RECORDMCOUNT := y
        export BUILD_C_RECORDMCOUNT
    endif
endif
endif
```



 Makefile.build中定义：



```
ifdef CONFIG_FTRACE_MCOUNT_RECORD
ifdef BUILD_C_RECORDMCOUNT
ifeq ("$(origin RECORDMCOUNT_WARN)", "command line")
  RECORDMCOUNT_FLAGS = -w
endif
# Due to recursion, we must skip empty.o.
# The empty.o file is created in the make process in order to determine
#  the target endianness and word size. It is made before all other C
#  files, including recordmcount.
sub_cmd_record_mcount =                    \
    if [ $(@) != "scripts/mod/empty.o" ]; then    \
        $(objtree)/scripts/recordmcount $(RECORDMCOUNT_FLAGS) "$(@)";    \
    fi;
recordmcount_source := $(srctree)/scripts/recordmcount.c \
            $(srctree)/scripts/recordmcount.h
else...
endif
...
# Built-in and composite module parts
$(obj)/%.o: $(src)/%.c $(recordmcount_source) FORCE
    $(call cmd,force_checksrc)
    $(call if_changed_rule,cc_o_c)

# Single-part modules are special since we need to mark them in $(MODVERDIR)

$(single-used-m): $(obj)/%.o: $(src)/%.c $(recordmcount_source) FORCE
    $(call cmd,force_checksrc)
    $(call if_changed_rule,cc_o_c)
    @{ echo $(@:.o=.ko); echo $@; } > $(MODVERDIR)/$(@F:.o=.mod)
```





## 6.2 ftrace的mcount功能是如何实现的？

在Documentation/trace/ftrace.txt中有一段解释：



```
If CONFIG_DYNAMIC_FTRACE is set, the system will run with virtually no overhead when function tracing is disabled.The way this works is the mcount function call (placed at the start of every kernel function, produced by the -pg switch in gcc),
starts of pointing to a simple return. (Enabling FTRACE will include the -pg switch in the compiling of the kernel.)

At compile time every C file object is run through the recordmcount program (located in the scripts directory).This program will parse the ELF headers in the C object to find all
the locations in the .text section that call mcount.(Note, only white listed .text sections are processed, since processing other sections like .init.text may cause races due to those sections being freed unexpectedly).

A new section called "__mcount_loc" is created that holds references to all the mcount call sites in the .text section.
The recordmcount program re-links this section back into the original object.The final linking stage of the kernel will add all these references into a single table.
```



 在c文件编译完之后，recordmcount增加一个__mcount_loc段。

在vmlinux.lds.h文件中对__mcount_loc段归集，在系统初始化的时候有两个参数很重要__start_mcount_loc和__stop_mcount_loc。

在available_function





```
#define MCOUNT_REC()    . = ALIGN(8);                \
            VMLINUX_SYMBOL(__start_mcount_loc) = .; \
            *(__mcount_loc)                \
            VMLINUX_SYMBOL(__stop_mcount_loc) = .;



/* init and exit section handling */
#define INIT_DATA                            \
    *(.init.data)                            \
...
    KERNEL_CTORS()                            \
    *(.init.rodata)                            \
    MCOUNT_REC()                            \
...
    KERNEL_DTB()


#define INIT_DATA_SECTION(initsetup_align)                \
    .init.data : AT(ADDR(.init.data) - LOAD_OFFSET) {        \
        INIT_DATA                        \
...
    }
```









## 6.3 引入ftrace对性能的影响有多大？

 在不使用的时候在入口点插入nop，在使用的时候才会替换成



```
On boot up, before SMP is initialized, the dynamic ftrace code scans this table and updates all the locations into nops.It also records the locations, which are added to the available_filter_functions list.在启动阶段，SMP初始化之前，ftrace扫描__mcount_loc段，将所有入口地址mcount使用nop替代。这样只要不打开，开销非常小，基本上不产生性能影响。Modules are processed as they are loaded and before they are executed.When a module is unloaded, it also removes its functions from the ftrace function list.This is automatic in the module unload code, and the module author does not need to worry about it.

When tracing is enabled, the process of modifying the function tracepoints is dependent on architecture....
The new method of modifying the function tracepoints is to place a breakpoint at the location to be modified,sync all CPUs, modify the rest of the instruction not covered by the breakpoint.Sync all CPUs again, and then remove the breakpoint with the finished version to the ftrace call site.
```



在内核初始化的初期，ftrace 查询 __mcount_loc 段，得到每个函数的入口地址，并将 mcount 替换为 nop 指令。这样在默认情况下，ftrace 不会对内核性能产生影响。

当用户打开 ftrace 功能时，ftrace 将这些 nop 指令动态替换为 ftrace_caller，该函数将调用用户注册的 trace 函数。

## 6.4 核心函数ftrace_caller/ftrace_graph_caller





```
#ifdef CONFIG_DYNAMIC_FTRACE
ENTRY(ftrace_caller)
UNWIND(.fnstart)
    __ftrace_caller
UNWIND(.fnend)
ENDPROC(ftrace_caller)
#endif


.macro __ftrace_caller suffix
    mcount_enter------------------------------------宏mcount_enter

    mcount_get_lr    r1            @ lr of instrumented func
    mcount_adjust_addr    r0, lr        @ instrumented function

    .globl ftrace_call\suffix
ftrace_call\suffix:
    bl    ftrace_stub

#ifdef CONFIG_FUNCTION_GRAPH_TRACER
    .globl ftrace_graph_call\suffix
ftrace_graph_call\suffix:
    mov    r0, r0
#endif

    mcount_exit------------------------------------宏mcount_exit
.endm
```

.macro mcount_enter----------------------------------mcount_enter定义
stmdb sp!, {r0-r3, lr}
.endm

```

```

.macro mcount_get_lr reg
ldr \reg, [fp, #-4]
.endm

```

```

.macro mcount_exit---------------------------------mcount_exit定义
ldr lr, [fp, #-4]
ldmia sp!, {r0-r3, pc}
.endm

```

```







function_graph：



```
#ifdef CONFIG_FUNCTION_GRAPH_TRACER
ENTRY(ftrace_graph_caller)
UNWIND(.fnstart)
    __ftrace_graph_caller
UNWIND(.fnend)
ENDPROC(ftrace_graph_caller)
#endif

.macro __ftrace_graph_caller
    sub    r0, fp, #4        @ &lr of instrumented routine (&parent)
#ifdef CONFIG_DYNAMIC_FTRACE
    @ called from __ftrace_caller, saved in mcount_enter
    ldr    r1, [sp, #16]        @ instrumented routine (func)
    mcount_adjust_addr    r1, r1
#else
    @ called from __mcount, untouched in lr
    mcount_adjust_addr    r1, lr    @ instrumented routine (func)
#endif
    mov    r2, fp            @ frame pointer
    bl    prepare_ftrace_return
    mcount_exit
.endm
```







参考文档：

1. [The Linux Kernel Tracepoint API](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html)

2. [Linux内核跟踪之trace框架分析](http://blog.chinaunix.net/uid-20543183-id-1930846.html)

3. [linux ftrace追踪一（基本技术结构粗略剖析）](http://blog.csdn.net/u011013137/article/details/9093823)

4. [使用 ftrace 调试 Linux 内核，第 1 部分](https://www.ibm.com/developerworks/cn/linux/l-cn-ftrace1/) & [使用 ftrace 调试 Linux 内核，第 2 部分](https://www.ibm.com/developerworks/cn/linux/l-cn-ftrace2/) & [使用 ftrace 调试 Linux 内核，第 3 部分](https://www.ibm.com/developerworks/cn/linux/l-cn-ftrace3/)

5. [Linux Tracepoint内核文档](http://elixir.free-electrons.com/linux/v3.4.110/source/Documentation/trace)

6. [ftrace简介](https://www.ibm.com/developerworks/cn/linux/l-cn-ftrace/index.html)
