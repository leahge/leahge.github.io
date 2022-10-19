---
title: sadc(8) — Linux manual page
date: 2022-10-13 20:18:51
tags:
---
# sadc(8) — Linux manual page

| [NAME](https://man7.org/linux/man-pages/man8/sadc.8.html#NAME) \| [SYNOPSIS](https://man7.org/linux/man-pages/man8/sadc.8.html#SYNOPSIS) \| [DESCRIPTION](https://man7.org/linux/man-pages/man8/sadc.8.html#DESCRIPTION) \| [OPTIONS](https://man7.org/linux/man-pages/man8/sadc.8.html#OPTIONS) \| [ENVIRONMENT](https://man7.org/linux/man-pages/man8/sadc.8.html#ENVIRONMENT) \| [EXAMPLES](https://man7.org/linux/man-pages/man8/sadc.8.html#EXAMPLES) \| [BUGS](https://man7.org/linux/man-pages/man8/sadc.8.html#BUGS) \| [FILES](https://man7.org/linux/man-pages/man8/sadc.8.html#FILES) \| [AUTHOR](https://man7.org/linux/man-pages/man8/sadc.8.html#AUTHOR) \| [SEE ALSO](https://man7.org/linux/man-pages/man8/sadc.8.html#SEE_ALSO) \| [COLOPHON](https://man7.org/linux/man-pages/man8/sadc.8.html#COLOPHON) |      |
| ------------------------------------------------------------ | ---- |
|                                                              |      |

```
SADC(8)                    Linux User's Manual                   SADC(8)
```

## NAME     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       sadc - System activity data collector.
```

## SYNOPSIS     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       /usr/local/lib64/sa/sadc [ -C comment ] [ -D ] [ -F ] [ -f ] [ -L
       ] [ -V ] [ -S { keyword[,...] | ALL | XALL } ] [ interval [ count
       ] ] [ outfile ]
```

## DESCRIPTION     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       The sadc command samples system data a specified number of times
       (count) at a specified interval measured in seconds (interval).
       It writes in binary format to the specified outfile or to
       standard output. If outfile is set to -, then sadc uses the
       standard system activity daily data file (see below).  In this
       case, if the file already exists, sadc will overwrite it if it is
       from a previous month. By default sadc collects most of the data
       available from the kernel.  But there are also optional metrics,
       for which the relevant options must be explicitly passed to sadc
       to be collected (see option -S below).

       The standard system activity daily data file is named saDD unless
       option -D is used, in which case its name is saYYYYMMDD, where
       YYYY stands for the current year, MM for the current month and DD
       for the current day. By default it is located in the /var/log/sa
       directory. Yet it is possible to specify an alternate location
       for it: If outfile is a directory (instead of a plain file) then
       it will be considered as the directory where the standard system
       activity daily data file will be saved.

       When the count parameter is not specified, sadc writes its data
       endlessly. When both interval and count are not specified, and
       option -C is not used, a dummy record, which is used at system
       startup to mark the time when the counter restarts from 0, will
       be written.  For example, one of the system startup script may
       write the restart mark to the daily data file by the command
       entry:

       /usr/local/lib64/sa/sadc -

       The sadc command is intended to be used as a backend to the sar
       command.

       Note: The sadc command only reports on local activities.
```

## OPTIONS     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       -C comment
              When neither the interval nor the count parameters are
              specified, this option tells sadc to write a dummy record
              containing the specified comment string. This comment can
              then be displayed with option -C of sar.

       -D     Use saYYYYMMDD instead of saDD as the standard system
              activity daily data file name.

       -F     The creation of outfile will be forced. If the file
              already exists and has a format unknown to sadc then it
              will be truncated. This may be useful for daily data files
              created by an older version of sadc and whose format is no
              longer compatible with current one.

       -f     fdatasync() will be used to ensure data is written to
              disk. This differs from the normal operation in that a
              sudden system reset is less likely to result in the saDD
              datafiles being corrupted. However, this is at the expense
              of performance within the sadc process as forward progress
              will be blocked while data is written to underlying disk
              instead of just to cache.

       -L     sadc will try to get an exclusive lock on the outfile
              before writing to it or truncating it. Failure to get the
              lock is fatal, except in the case of trying to write a
              normal (i.e. not a dummy and not a header) record to an
              existing file, in which case sadc will try again at the
              next interval. Usually, the only reason a lock would fail
              would be if another sadc process were also writing to the
              file. This can happen when cron is used to launch sadc. If
              the system is under heavy load, an old sadc might still be
              running when cron starts a new one. Without locking, this
              situation can result in a corrupted system activity file.

       -S { keyword[,...] | ALL | XALL }
              Possible keywords are DISK, INT, IPV6, POWER, SNMP, XDISK,
              ALL and XALL.
              Specify which optional activities should be collected by
              sadc.  Some activities are optional to prevent data files
              from growing too large. The DISK keyword indicates that
              sadc should collect data for block devices. The INT
              keyword indicates that sadc should collect data for system
              interrupts. The IPV6 keyword indicates that IPv6
              statistics should be collected by sadc. The POWER keyword
              indicates that sadc should collect power management
              statistics. The SNMP keyword indicates that SNMP
              statistics should be collected by sadc. The ALL keyword is
              equivalent to specifying all the keywords above and
              therefore all previous activities are collected.

              The XDISK keyword is an extension to the DISK one and
              indicates that partitions and filesystems statistics
              should be collected by sadc in addition to disk
              statistics. This option works only with kernels 2.6.25 and
              later. The XALL keyword is equivalent to specifying all
              the keywords above (including keyword extensions) and
              therefore all possible activities are collected.

              Important note: The activities (including optional ones)
              saved in an existing data file prevail over those selected
              with option -S.  As a consequence, appending data to an
              existing data file will result in option -S being ignored.

       -V     Print version number then exit.
```

## ENVIRONMENT     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       The sadc command takes into account the following environment
       variable:

       S_TIME_DEF_TIME
              If this variable exists and its value is UTC then sadc
              will save its data in UTC time.  sadc will also use UTC
              time instead of local time to determine the current daily
              data file located in the /var/log/sa directory.
```

## EXAMPLES     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       /usr/local/lib64/sa/sadc 1 10 /tmp/datafile
              Write 10 records of one second intervals to the
              /tmp/datafile binary file.

       /usr/local/lib64/sa/sadc -C "Backup Start" /tmp/datafile
              Insert the comment "Backup Start" into the file
              /tmp/datafile.
```

## BUGS     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       The /proc filesystem must be mounted for the sadc command to
       work.

       All the statistics are not necessarily available, depending on
       the kernel version used.  sadc assumes that you are using at
       least a 2.6 kernel.
```

## FILES     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       /var/log/sa/saDD
       /var/log/sa/saYYYYMMDD
              The standard system activity daily data files and their
              default location.  YYYY stands for the current year, MM
              for the current month and DD for the current day.
       /proc and /sys contain various files with system statistics.
```

## AUTHOR     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       Sebastien Godard (sysstat <at> orange.fr)
```

## SEE ALSO     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       sar(1), sa1(8), sa2(8), sadf(1), sysstat(5)

       https://github.com/sysstat/sysstat
       http://pagesperso-orange.fr/sebastien.godard/
```

## COLOPHON     [top](https://man7.org/linux/man-pages/man8/sadc.8.html#top_of_page)

```
       This page is part of the sysstat (sysstat performance monitoring
       tools) project.  Information about the project can be found at
       ⟨http://sebastien.godard.pagesperso-orange.fr/⟩.  If you have a
       bug report for this manual page, send it to sysstat-AT-orange.fr.
       This page was obtained from the project's upstream Git repository
       ⟨https://github.com/sysstat/sysstat.git⟩ on 2021-08-27.  (At that
       time, the date of the most recent commit that was found in the
       repository was 2021-07-17.)  If you discover any rendering
       problems in this HTML version of the page, or you believe there
       is a better or more up-to-date source for the page, or you have
       corrections or improvements to the information in this COLOPHON
       (which is not part of the original manual page), send a mail to
       man-pages@man7.org
```
