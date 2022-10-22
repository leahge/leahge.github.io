---
title: ltrace(1) — Linux manual page
date: 2022-10-13 23:13:18
---
# ltrace(1) — Linux manual page

| [NAME](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#NAME) \| [SYNOPSIS](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#SYNOPSIS) \| [DESCRIPTION](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#DESCRIPTION) \| [OPTIONS](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#OPTIONS) \| [FILTER SPECIFICATIONS](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#FILTER_SPECIFICATIONS) \| [FILTER EXPRESSIONS](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#FILTER_EXPRESSIONS) \| [PROTOTYPE LIBRARY DISCOVERY](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#PROTOTYPE_LIBRARY_DISCOVERY) \| [BUGS](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#BUGS) \| [FILES](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#FILES) \| [AUTHOR](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#AUTHOR) \| [SEE ALSO](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#SEE_ALSO) \| [COLOPHON](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#COLOPHON) |      |
| ------------------------------------------------------------ | ---- |
|                                                              |      |

```
LTRACE(1)                     User Commands                    LTRACE(1)
```

## NAME     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       ltrace - A library call tracer
```

## SYNOPSIS     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       ltrace [-e filter|-L] [-l|--library=library_pattern] [-x filter]
       [-S] [-b|--no-signals] [-i] [-w|--where=nr] [-r|-t|-tt|-ttt] [-T]
       [[-F|--config] pathlist] [-A maxelts] [-s strsize]
       [-C|--demangle] [-a|--align column] [-n|--indent nr] [-o|--output
       filename] [-D|--debug mask] [-u username] [-f] [-p pid] [[--]
       command [arg ...]]

       ltrace -c [-e filter|-L] [-l|--library=library_pattern] [-x
       filter] [-S] [-o|--output filename] [-f] [-p pid] [[--] command
       [arg ...]]

       ltrace -V|--version

       ltrace -h|--help
```

## DESCRIPTION     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       ltrace is a program that simply runs the specified command until
       it exits.  It intercepts and records the dynamic library calls
       which are called by the executed process and the signals which
       are received by that process.  It can also intercept and print
       the system calls executed by the program.

       Its use is very similar to strace(1).

       ltrace shows parameters of invoked functions and system calls.
       To determine what arguments each function has, it needs external
       declaration of function prototypes.  Those are stored in files
       called prototype libraries--see ltrace.conf(5) for details on the
       syntax of these files.  See the section PROTOTYPE LIBRARY
       DISCOVERY to learn how ltrace finds prototype libraries.
```

## OPTIONS     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       -a, --align column
              Align return values in a specific column (default column
              is 5/8 of screen width).

       -A maxelts
              Maximum number of array elements to print before
              suppressing the rest with an ellipsis ("...").  This also
              limits number of recursive structure expansions.

       -b, --no-signals
              Disable printing of signals received by the traced
              process.

       -c     Count time and calls for each library call and report a
              summary on program exit.

       -C, --demangle
              Decode (demangle) low-level symbol names into user-level
              names.  Besides removing any initial underscore prefix
              used by the system, this makes C++ function names
              readable.

       -D, --debug mask
              Show debugging output of ltrace itself.  mask is a number
              describing which debug messages should be displayed.  Use
              the option -Dh to see what can be used, but note that
              currently the only reliable debugmask is 77, which shows
              all debug messages.

       -e filter
              A qualifying expression which modifies which library calls
              (i.e. calls done through PLT slots, which are typically
              calls from the main binary to a library, or inter-library
              calls) to trace. Usage examples and the syntax description
              appear below in sections FILTER SPECIFICATIONS and FILTER
              EXPRESSIONS. If more than one -e option appears on the
              command line, the library calls that match any of them are
              traced. If no -e is given, @MAIN is assumed as a default.

       -f     Trace child processes as they are created by currently
              traced processes as a result of the fork(2) or clone(2)
              system calls.  The new process is attached immediately.

       -F, --config pathlist
              Contains a colon-separated list of paths.  If a path
              refers to a directory, that directory is considered when
              prototype libraries are searched (see the section
              PROTOTYPE LIBRARY DISCOVERY).  If it refers to a file,
              that file is imported implicitly to all loaded prototype
              libraries.

       -h, --help
              Show a summary of the options to ltrace and exit.

       -i     Print the instruction pointer at the time of the library
              call.

       -l, --library library_pattern
              Display only calls to functions implemented by libraries
              that match library_pattern.  This is as if you specified
              one -e for every symbol implemented in a library specified
              by library_pattern.  Multiple library patters can be
              specified with several instances of this option.  Usage
              examples and the syntax description of library_pattern
              appear below in sections FILTER SPECIFICATIONS and FILTER
              EXPRESSIONS.

              Note that while this option selects calls that might be
              directed to the selected libraries, there's no actual
              guarantee that the call won't be directed elsewhere due to
              e.g. LD_PRELOAD or simply dependency ordering.  If you
              want to make sure that symbols in given library are
              actually called, use -x @library_pattern instead.

       -L     When no -e option is given, don't assume the default
              action of @MAIN.  In practice this means that library
              calls will not be traced.

       -n, --indent nr
              Indent trace output by nr spaces for each level of call
              nesting. Using this option makes the program flow
              visualization easy to follow.  This indents uselessly also
              functions that never return, such as service functions for
              throwing exceptions in the C++ runtime.

       -o, --output filename
              Write the trace output to the file filename rather than to
              stderr.

       -p pid Attach to the process with the process ID pid and begin
              tracing.  This option can be used together with passing a
              command to execute.  It is possible to attach to several
              processes by passing more than one option -p.

       -r     Print a relative timestamp with each line of the trace.
              This records the time difference between the beginning of
              successive lines.

       -s strsize
              Specify the maximum string size to print (the default is
              32).

       -S     Display system calls as well as library calls

       -t     Prefix each line of the trace with the time of day.

       -tt    If given twice, the time printed will include the
              microseconds.

       -ttt   If given thrice, the time printed will include the
              microseconds and the leading portion will be printed as
              the number of seconds since the epoch.

       -T     Show  the  time  spent inside each call. This records the
              time difference between the beginning and the end of each
              call.

       -u username
              Run command with the userid, groupid and supplementary
              groups of username.  This option is only useful when
              running as root and enables the correct execution of
              setuid and/or setgid binaries.

       -w, --where nr
              Show backtrace of nr stack frames for each traced
              function. This option enabled only if elfutils or
              libunwind support was enabled at compile time.

       -x filter
              A qualifying expression which modifies which symbol table
              entry points to trace (those are typically calls inside a
              library or main binary, though PLT calls, traced by -e,
              land on entry points as well). Usage examples and the
              syntax description appear below in sections FILTER
              SPECIFICATIONS and FILTER EXPRESSIONS. If more than one -x
              option appears on the command line, the symbols that match
              any of them are traced. No entry points are traced if no
              -x is given.

       -V, --version
              Show the version number of ltrace and exit.
```

## FILTER SPECIFICATIONS     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       Filters are specified with the -l, -e and -x options. In short
       they mean:

       -x is ´show me what calls these symbols (including local calls)´

       -e is ´show me what calls these symbols (inter-library calls
       only)´

       -l is ´show me what calls into this library´

       Suppose I have a library defined with this header tstlib.h:

        void func_f_lib(void);
        void func_g_lib(void);

       and this implementation tstlib.c:

        #include "tstlib.h"
        void func_f_lib(void)
        {
            func_g_lib();
        }
        void func_g_lib(void)
        {
        }

       Suppose I have an executable that uses this library defined like
       this tst.c:

        #include "tstlib.h"
        void func_f_main(void)
        {
        }
        void main(void)
        {
            func_f_main();
            func_f_lib();
        }

       If linking without -Bsymbolic, the internal func_g_lib() call
       uses the PLT like external calls, and thus ltrace says:

        $ ltrace -x 'func*' -L ./tst
        func_f_main()                             = <void>
        func_f_lib@tstlib.so( <unfinished ...>
        func_g_lib@tstlib.so()                    = <void>
        <... func_f_lib resumed> )                = <void>
        +++ exited (status 163) +++

        $ ltrace -e 'func*' ./tst
        tst->func_f_lib( <unfinished ...>
        tstlib.so->func_g_lib()                   = <void>
        <... func_f_lib resumed> )                = <void>
        +++ exited (status 163) +++

        $ ltrace -l tstlib.so ./tst
        tst->func_f_lib( <unfinished ...>
        tstlib.so->func_g_lib()                   = <void>
        <... func_f_lib resumed> )                = <void>
        +++ exited (status 163) +++

       By contrast, if linking with -Bsymbolic, then the internal
       func_g_lib() call bypasses the PLT, and ltrace says:

        $ ltrace -x 'func*' -L ./tst
        func_f_main() = <void>
        func_f_lib@tstlib.so( <unfinished ...>
        func_g_lib@tstlib.so()                    = <void>
        <... func_f_lib resumed> )                = <void>
        +++ exited (status 163) +++

        $ ltrace -e 'func*' ./tst
        tst->func_f_lib()                         = <void>
        +++ exited (status 163) +++

        $ ltrace -l tstlib.so ./tst
        tst->func_f_lib()                         = <void>
        +++ exited (status 163) +++
```

## FILTER EXPRESSIONS     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       Filter expression is a chain of glob- or regexp-based rules that
       are used to pick symbols for tracing from libraries that the
       process uses.  Most of it is intuitive, so as an example, the
       following would trace calls to malloc and free, except those done
       by libc:

       -e malloc+free-@libc.so*

       This reads: trace malloc and free, but don't trace anything that
       comes from libc.  Semi-formally, the syntax of the above example
       looks approximately like this:

       {[+-][symbol_pattern][@library_pattern]}

       Symbol_pattern is used to match symbol names, library_pattern to
       match library SONAMEs.  Both are implicitly globs, but can be
       regular expressions as well (see below).  The glob syntax
       supports meta-characters * and ? and character classes, similarly
       to what basic bash globs support.  ^ and $ are recognized to
       mean, respectively, start and end of given name.

       Both symbol_pattern and library_pattern have to match the whole
       name.  If you want to match only part of the name, surround it
       with one or two *'s as appropriate.  The exception is if the
       pattern is not mentioned at all, in which case it's as if the
       corresponding pattern were *.  (So malloc is really malloc@* and
       @libc.* is really *@libc.*.)

       In libraries that don't have an explicit SONAME, basename is
       taken for SONAME.  That holds for main binary as well: /bin/echo
       has an implicit SONAME of echo.  In addition to that, special
       library pattern MAIN always matches symbols in the main binary
       and never a library with actual SONAME MAIN (use e.g. ^MAIN or
       [M]AIN for that).

       If the symbol or library pattern is surrounded in slashes (/like
       this/), then it is considered a regular expression instead.  As a
       shorthand, instead of writing /x/@/y/, you can write /x@y/.

       If the library pattern starts with a slash, it is not a SONAME
       expression, but a path expression, and is matched against the
       library path name.

       The first rule may lack a sign, in which case + is assumed.  If,
       on the other hand, the first rule has a - sign, it is as if there
       was another rule @ in front of it, which has the effect of
       tracing complement of given rule.

       The above rules are used to construct the set of traced symbols.
       Each candidate symbol is passed through the chain of above rules.
       Initially, the symbol is unmarked.  If it matches a + rule, it
       becomes marked, if it matches a - rule, it becomes unmarked
       again.  If, after applying all rules, the symbol is marked, it
       will be traced.
```

## PROTOTYPE LIBRARY DISCOVERY     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       When a library is mapped into the address space of a traced
       process, ltrace needs to know what the prototypes are of
       functions that this library implements.  For purposes of ltrace,
       prototype really is a bit more than just type signature: it's
       also formatting of individual parameters and of return value.
       These prototypes are stored in files called prototype libraries.

       After a library is mapped, ltrace finds out what its SONAME is.
       It then looks for a file named SONAME.conf--e.g. protolib for
       libc.so.6 would be in a file called libc.so.6.conf.  When such
       file is found (more about where ltrace looks for these files is
       below), ltrace reads all prototypes stored therein.  When a
       symbol table entry point (such as those traced by -x) is hit, the
       prototype is looked up in a prototype library corresponding to
       the library where the hit occurred.  When a library call (such as
       those traced by -e and -l) is hit, the prototype is looked up in
       all prototype libraries loaded for given process.  That is
       necessary, because a library call is traced in a PLT table of a
       caller library, but the prototype is described at callee library.

       If a library has no SONAME, basename of library file is
       considered instead.  For the main program binary, basename is
       considered as well (e.g. protolib for /bin/echo would be called
       echo.conf).  If a name corresponding to soname (e.g.
       libc.so.6.conf) is not found, and the module under consideration
       is a shared library, ltrace also tries partial matches.  Ltrace
       snips one period after another, retrying the search, until either
       a protolib is found, or X.so is all that's left.  Thus
       libc.so.conf would be considered, but libc.conf not.

       When looking for a prototype library, ltrace potentially looks
       into several directories.  On Linux, those are
       $XDG_CONFIG_HOME/ltrace, $HOME/.ltrace, X/ltrace for each X in
       $XDG_CONFIG_DIRS and /usr/share/ltrace.  If the environment
       variable XDG_CONFIG_HOME is not defined, ltrace looks into
       $HOME/.config/ltrace instead.

       There's also a mechanism for loading legacy config files.  If
       $HOME/.ltrace.conf exists it is imported to every loaded
       prototype library.  Similarly for /etc/ltrace.conf.  If both
       exist, both are imported, and $HOME/.ltrace.conf is consulted
       before /etc/ltrace.conf.

       If -F contains any directories, those are searched in precedence
       to the above system directories, in the same order in which they
       are mentioned in -F.  Any files passed in -F are imported
       similarly to above legacy config files, before them.

       See ltrace.conf(5) for details on the syntax of ltrace prototype
       library files.
```

## BUGS     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       It has most of the bugs stated in strace(1).

       It only works on Linux and in some architectures.

       If you would like to report a bug, send a message to the mailing
       list (ltrace-devel@lists.alioth.debian.org), or use the
       reportbug(1) program if you are under the Debian GNU/Linux
       distribution.
```

## FILES     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       /etc/ltrace.conf
              System configuration file

       ~/.ltrace.conf
              Personal config file, overrides /etc/ltrace.conf
```

## AUTHOR     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       Juan Cespedes <cespedes@debian.org>
       Petr Machata <pmachata@redhat.com>
```

## SEE ALSO     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       ltrace.conf(5), strace(1), ptrace(2)
```

## COLOPHON     [top](https://www.man7.org/linux/man-pages/man1/ltrace.1.html#top_of_page)

```
       This page is part of the ltrace (library call tracer) project.
       Information about the project can be found at
       ⟨http://ltrace.org/⟩.  If you have a bug report for this manual
       page, see ⟨http://ltrace.org/⟩.  This page was obtained from the
       project's upstream Git repository
       ⟨https://github.com/dkogan/ltrace⟩ on 2021-08-27.  (At that time,
       the date of the most recent commit that was found in the
       repository was 2016-09-01.)  If you discover any rendering
       problems in this HTML version of the page, or you believe there
       is a better or more up-to-date source for the page, or you have
       corrections or improvements to the information in this COLOPHON
       (which is not part of the original manual page), send a mail to
       man-pages@man7.org

                              January 2013                     LTRACE(1)
```
