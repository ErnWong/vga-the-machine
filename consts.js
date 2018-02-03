const path = require('path');

const DIR_BUILD = path.resolve('build');
const DIR_SRC = path.resolve('src');
const DIR_LIB = path.resolve('lib');
const DIR_RES = path.resolve('res');
const DIR_TOOLS = path.resolve('tools');

const LIB_V86 = path.resolve(DIR_LIB, 'libv86.js');

const GZIP_FDA_DOS = path.resolve(DIR_RES, 'fda-freedos.img.gz');
const FILE_FDA_DOS = path.resolve(DIR_RES, 'fda-freedos.img');
const GZIP_HDA_SMLRC = path.resolve(DIR_RES, 'hda-smlrc.img.gz');
const FILE_HDA_SMLRC = path.resolve(DIR_RES, 'hda-smlrc.img');

const FILE_STATE_CLEAN = path.resolve(DIR_RES, 'state-clean.bin');
const FILE_BIOS = path.resolve(DIR_RES, 'seabios.bin');
const FILE_VGABIOS = path.resolve(DIR_RES, 'vgabios.bin');

const FILE_FDA_FAILED = path.resolve(DIR_BUILD, 'fda-vga-failed.img');

const FILE_EXE_MAIN = path.resolve(DIR_BUILD, 'vga.exe');
const FILE_FDA_MAIN = path.resolve(DIR_BUILD, 'fda-vga.img');
const FILE_STATE_MAIN = path.resolve(DIR_BUILD, 'state-vga.bin');

const RESOURCES = [
  LIB_V86,
  GZIP_FDA_DOS,
  GZIP_HDA_SMLRC,
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
  GZIP_FDA_DOS,
  FILE_FDA_DOS,
  GZIP_HDA_SMLRC,
  FILE_HDA_SMLRC,
  FILE_STATE_CLEAN,
  FILE_BIOS,
  FILE_VGABIOS,
  FILE_FDA_FAILED,
  FILE_EXE_MAIN,
  FILE_FDA_MAIN,
  FILE_STATE_MAIN,
  RESOURCES
};
