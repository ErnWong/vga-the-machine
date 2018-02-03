# VGA The Machine

Ever found yourself confused and lost as you read through [page](http://wiki.osdev.org/VGA_Hardware) after [page](http://www.osdever.net/FreeVGA/vga/vga.htm), [manual](http://www.mcamafia.de/pdf/ibm_vgaxga_trm2.pdf) after [manual](https://01.org/sites/default/files/documentation/intel-gfx-prm-osrc-hsw-display_0.pdf), trying to decipher how the original IBM Video Graphics Array worked during its prime?

This project will try to be an interactive demonstration that illustrates how each VGA register setting works together to result in the documented video modes. It is also intended that this project can help test the VGA functionality of real vs emulated VGA hardware.

**Status: WIP.** At this stage, this project exists only as a dream. See [TODO](#todo) below.
**Disclaimer:** Information presented in this project is likely to be incorrect during the early stages. Use only as a supplement to official VGA manuals.

## Dependencies

After cloning this repo to your machine, you only need to have [Node.js](https://nodejs.org/en/) installed on your system to build this project.

Credits to:

- [Virtual x86](https://github.com/copy/v86) to host the DOS environment (`lib/libv86.js`),
- [FreeDOS 1.2](http://www.freedos.org/) for OS (`res/hda_freedos.img`), and
- [Open Watcom 1.9](http://www.openwatcom.org/) for the DOS compiler (within `res/hda_freedos.img`).

## Building

To generate the program, run the following:

```sh
node build.js
```

This will create three new files in the `build` folder:

- `vga.exe` will be the DOS program, while
- `hda-vga.img` will be the hard disk image required to run the program via the Virtual x86 emulator, and
- `state-vga.bin` will be the emulator state file captured immediately after the DOS program started running.

If the build process appears to be stuck, press `d` to display the screen of the Virtual x86 emulator, and inspect for any errors.

## TODO

- [x] Build pipeline.
- [ ] Web page to view the program via Virtual x86.
- [ ] The actual program itself.

## Contributing

As parts of this project slowly start to piece together, you are more than welcome to:

- Report bugs, typos, errors, and incorrect information in the issue tracker.
- Proof read information.
- Help verify the information on real hardware.
- Translate, although more research will be needed to render characters outside [CP437](https://en.wikipedia.org/wiki/Code_page_437)
