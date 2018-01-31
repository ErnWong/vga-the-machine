# VGA The Machine

Interactive demonstration of how VGA works, and a collection of tests for emulator writers.

**Status:** Work in progress. See [TODO](#todo) below.

## Dependencies

After cloning this repo to your machine, you only need to have [Node.js](https://nodejs.org/en/) installed on your system to build this project.

Credits to:

- [Virtual x86](https://github.com/copy/v86) to host the DOS environment,
- [FreeDos 1.2](http://www.freedos.org/) for OS, and
- [Open Watcom 1.9](http://www.openwatcom.org/) for the DOS compiler.

FreeDos and Open Watcom are packaged within the hard disk image `res/hda-freedos.img`.

## Building

Run the following:

```sh
node build.js
```

## TODO

- [x] Build pipeline.
- [ ] Web page to view the program via Virtual x86.
- [ ] The actual program itself.
