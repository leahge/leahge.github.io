---
title: df(1)
date: 2022-10-13 20:18:51
tags:
---

# df(1) — Linux manual page

| [NAME](https://man7.org/linux/man-pages/man1/df.1.html#NAME) \| [SYNOPSIS](https://man7.org/linux/man-pages/man1/df.1.html#SYNOPSIS) \| [DESCRIPTION](https://man7.org/linux/man-pages/man1/df.1.html#DESCRIPTION) \| [OPTIONS](https://man7.org/linux/man-pages/man1/df.1.html#OPTIONS) \| [AUTHOR](https://man7.org/linux/man-pages/man1/df.1.html#AUTHOR) \| [REPORTING BUGS](https://man7.org/linux/man-pages/man1/df.1.html#REPORTING_BUGS) \| [COPYRIGHT](https://man7.org/linux/man-pages/man1/df.1.html#COPYRIGHT) \| [SEE ALSO](https://man7.org/linux/man-pages/man1/df.1.html#SEE_ALSO) \| [COLOPHON](https://man7.org/linux/man-pages/man1/df.1.html#COLOPHON) |      |
| ------------------------------------------------------------ | ---- |
|                                                              |      |

```
DF(1)                         User Commands                        DF(1)
```

## NAME     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       df - report file system disk space usage
```

## SYNOPSIS     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       df [OPTION]... [FILE]...
```

## DESCRIPTION     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       This manual page documents the GNU version of df.  df displays
       the amount of disk space available on the file system containing
       each file name argument.  If no file name is given, the space
       available on all currently mounted file systems is shown.  Disk
       space is shown in 1K blocks by default, unless the environment
       variable POSIXLY_CORRECT is set, in which case 512-byte blocks
       are used.

       If an argument is the absolute file name of a disk device node
       containing a mounted file system, df shows the space available on
       that file system rather than on the file system containing the
       device node.  This version of df cannot show the space available
       on unmounted file systems, because on most kinds of systems doing
       so requires very nonportable intimate knowledge of file system
       structures.
```

## OPTIONS     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       Show information about the file system on which each FILE
       resides, or all file systems by default.

       Mandatory arguments to long options are mandatory for short
       options too.

       -a, --all
              include pseudo, duplicate, inaccessible file systems

       -B, --block-size=SIZE
              scale sizes by SIZE before printing them; e.g., '-BM'
              prints sizes in units of 1,048,576 bytes; see SIZE format
              below

       -h, --human-readable
              print sizes in powers of 1024 (e.g., 1023M)

       -H, --si
              print sizes in powers of 1000 (e.g., 1.1G)

       -i, --inodes
              list inode information instead of block usage

       -k     like --block-size=1K

       -l, --local
              limit listing to local file systems

       --no-sync
              do not invoke sync before getting usage info (default)

       --output[=FIELD_LIST]
              use the output format defined by FIELD_LIST, or print all
              fields if FIELD_LIST is omitted.

       -P, --portability
              use the POSIX output format

       --sync invoke sync before getting usage info

       --total
              elide all entries insignificant to available space, and
              produce a grand total

       -t, --type=TYPE
              limit listing to file systems of type TYPE

       -T, --print-type
              print file system type

       -x, --exclude-type=TYPE
              limit listing to file systems not of type TYPE

       -v     (ignored)

       --help display this help and exit

       --version
              output version information and exit

       Display values are in units of the first available SIZE from
       --block-size, and the DF_BLOCK_SIZE, BLOCK_SIZE and BLOCKSIZE
       environment variables.  Otherwise, units default to 1024 bytes
       (or 512 if POSIXLY_CORRECT is set).

       The SIZE argument is an integer and optional unit (example: 10K
       is 10*1024).  Units are K,M,G,T,P,E,Z,Y (powers of 1024) or
       KB,MB,... (powers of 1000).  Binary prefixes can be used, too:
       KiB=K, MiB=M, and so on.

       FIELD_LIST is a comma-separated list of columns to be included.
       Valid field names are: 'source', 'fstype', 'itotal', 'iused',
       'iavail', 'ipcent', 'size', 'used', 'avail', 'pcent', 'file' and
       'target' (see info page).
```

## AUTHOR     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       Written by Torbjorn Granlund, David MacKenzie, and Paul Eggert.
```

## REPORTING BUGS     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       GNU coreutils online help:
       <https://www.gnu.org/software/coreutils/>
       Report any translation bugs to
       <https://translationproject.org/team/>
```

## COPYRIGHT     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       Copyright © 2020 Free Software Foundation, Inc.  License GPLv3+:
       GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
       This is free software: you are free to change and redistribute
       it.  There is NO WARRANTY, to the extent permitted by law.
```

## SEE ALSO     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       Full documentation <https://www.gnu.org/software/coreutils/df>
       or available locally via: info '(coreutils) df invocation'
```

## COLOPHON     [top](https://man7.org/linux/man-pages/man1/df.1.html#top_of_page)

```
       This page is part of the coreutils (basic file, shell and text
       manipulation utilities) project.  Information about the project
       can be found at ⟨http://www.gnu.org/software/coreutils/⟩.  If you
       have a bug report for this manual page, see
       ⟨http://www.gnu.org/software/coreutils/⟩.  This page was obtained
       from the tarball coreutils-8.32.tar.xz fetched from
       ⟨http://ftp.gnu.org/gnu/coreutils/⟩ on 2021-08-27.  If you
       discover any rendering problems in this HTML version of the page,
       or you believe there is a better or more up-to-date source for
       the page, or you have corrections or improvements to the
       information in this COLOPHON (which is not part of the original
       manual page), send a mail to man-pages@man7.org
```
