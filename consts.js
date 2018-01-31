const path = require('path');

const DIR_BUILD = path.resolve('build');
const DIR_SRC = path.resolve('src');
const DIR_LIB = path.resolve('lib');
const DIR_RES = path.resolve('res');
const DIR_TOOLS = path.resolve('tools');

const LIB_V86 = path.resolve(DIR_LIB, 'libv86.js');

const FILE_HDA_DOS = path.resolve(DIR_RES, 'hda-freedos.img');
const FILE_STATE_CLEAN = path.resolve(DIR_RES, 'state-clean.bin');
const FILE_BIOS = path.resolve(DIR_RES, 'seabios.bin');
const FILE_VGABIOS = path.resolve(DIR_RES, 'vgabios.bin');

const FILE_EXE_MAIN = path.resolve(DIR_BUILD, 'vga.exe');
const FILE_HDA_MAIN = path.resolve(DIR_BUILD, 'hda-vga.img');
const FILE_STATE_MAIN = path.resolve(DIR_BUILD, 'state-vga.bin');

const RESOURCES = [
  LIB_V86,
  FILE_HDA_DOS,
  FILE_BIOS,
  FILE_VGABIOS
];

module.exports = {
  DIR_BUILD,
  DIR_SRC,
  DIR_LIB,
  DIR_RES,
  DIR_TOOLS,
  LIB_V86,
  FILE_HDA_DOS,
  FILE_STATE_CLEAN,
  FILE_BIOS,
  FILE_VGABIOS,
  FILE_EXE_MAIN,
  FILE_HDA_MAIN,
  FILE_STATE_MAIN,
  RESOURCES
};
