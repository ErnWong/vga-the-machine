const util = require('util');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const V86Starter = require('./lib/libv86.js').V86Starter;
const consts = require('./consts.js');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const gunzip = util.promisify(zlib.gunzip);

const LOG_INFO = true;
const LOG_ERROR = true;

function logInfo(msg) {
  if (!LOG_INFO) return;
  console.log(`[\x1b[94m info\x1b[39m] ${msg}`.padEnd(30 + 32));
}

function logError(msg) {
  if (!LOG_ERROR) return;
  console.log(`[\x1b[91merror\x1b[39m] \x1b[91m${msg}\x1b[39m`.padEnd(30 + 32));
}

function logSuccess(msg) {
  logInfo(`\x1b[92m${msg}\x1b[39m`);
}

async function loadAsBuffer(file) {
  const nodejsBuffer = await readFile(file);
  return new Uint8Array(nodejsBuffer).buffer;
}

async function build() {

  const missingResources = consts.RESOURCES.filter(res => !fs.existsSync(res));

  if (missingResources.length) {
    logError('The following resources required for build is missing:');
    console.log(missingResources.join('\n'));
    process.exit(1);
  }

  if (!fs.existsSync(consts.FILE_FDA_DOS)) {
    logInfo('Unzipping dos fda image');
    let fdaZipped = await readFile(consts.GZIP_FDA_DOS);
    let fdaUnzipped = await gunzip(fdaZipped);
    await writeFile(consts.FILE_FDA_DOS, fdaUnzipped);
  }

  if (!fs.existsSync(consts.FILE_HDA_SMLRC)) {
    logInfo('Unzipping smlrc hda image');
    let hdaZipped = await readFile(consts.GZIP_HDA_SMLRC);
    let hdaUnzipped = await gunzip(hdaZipped);
    await writeFile(consts.FILE_HDA_SMLRC, hdaUnzipped);
  }

  let settings = {
    bios: {},
    vga_bios: {},
    fda: {},
    hda: {},
    autostart: true,
    screen_dummy: true
  };

  logInfo('Loading images');
  settings.bios.buffer = await loadAsBuffer(consts.FILE_BIOS);
  settings.vga_bios.buffer = await loadAsBuffer(consts.FILE_VGABIOS);
  settings.fda.buffer = await loadAsBuffer(consts.FILE_FDA_DOS);
  settings.hda.buffer = await loadAsBuffer(consts.FILE_HDA_SMLRC);

  const fdaMtimeMs = (await stat(consts.FILE_FDA_DOS)).mtimeMs;
  const hdaMtimeMs = (await stat(consts.FILE_HDA_SMLRC)).mtimeMs;
  let stateMtimeMs = -Infinity;
  try {
    stateMtimeMs = (await stat(consts.FILE_STATE_CLEAN)).mtimeMs;
  } catch (err) {

    if (err.code === 'ENOENT')
      logInfo('Clean state file does not exist - creating...');
    else
      throw err;

  }

  const isUsingState = stateMtimeMs > Math.max(fdaMtimeMs, hdaMtimeMs);

  if (isUsingState) {
    settings.initial_state = {};
    settings.initial_state.buffer = await loadAsBuffer(consts.FILE_STATE_CLEAN);
  }

  logInfo('Starting emulator');
  const emulator = new V86Starter(settings);
  showEmulatorSpeed();
  listenForUserCommands();

  if (!isUsingState) {

    logInfo('Waiting for boot');
    await untilScreenText('Press F8 to trace or F5 to skip');
    emulator.keyboard_send_text('\n');

    logInfo('Waiting for shell');
    await untilScreenText('A:\\>');

    logInfo('Saving clean shell state');
    await saveState(consts.FILE_STATE_CLEAN);

  }

  await untilScreenText('A:\\>');
  await sendCommand('SET PATH=%PATH%;C:\\BIND;C:\\');
  await sendCommand('SET SMLRC=C:\\');
  await sendCommand('SET SMLRASM=C:\\YASM.exe');
  await sendCommand('DIR C:');

  logInfo('Transfering files...');
  await transferDirectory(consts.DIR_TOOLS, 'A:\\TOOLS');
  await transferDirectory(consts.DIR_SRC, 'A:\\SRC');

  logInfo('Compiling tools');
  await sendCommand('A:\\TOOLS\\BUILD.BAT');
  await testErrorCode();

  logInfo('Compiling program');
  await sendCommand('A:\\SRC\\BUILD.BAT');
  await testErrorCode();

  logInfo('Retrieving binaries');
  await retrieveBinaryFile('A:\\MAIN.EXE', consts.FILE_EXE_MAIN);

  logInfo('Running program');
  await sendCommand('MAIN');

  logInfo('Saving fda image');
  await saveDisk(consts.FILE_FDA_MAIN);

  logInfo('Saving in-program state');
  await saveState(consts.FILE_STATE_MAIN);

  logSuccess('Done!');
  process.exit();

  async function saveState(destination) {
    const state = await util.promisify(emulator.save_state.bind(emulator))();
    await writeFile(destination, new Uint8Array(state));
  }

  async function saveDisk(destination) {
    await writeFile(destination, new Uint8Array(settings.fda.buffer));
  }

  function listenForUserCommands() {

    logInfo('\x1b[94mPress d anytime to draw the emulator screen\x1b[39m');
    logInfo('\x1b[94mPress q anytime to exit\x1b[39m');

    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
      switch (key) {
        case 'd':
          drawScreen();
          break;
        case 'q':
        case '\x03': // ctrl-c
          process.exit();
          break;
      }
    });

  }

  function showEmulatorSpeed() {

    const refreshMs = 200;
    let countPrev = 0;

    let id = setInterval(() => {

      if (!emulator.cpu_is_running)
        clearInterval(id);

      let count = emulator.get_instruction_counter();
      let kips = `${(count - countPrev) / refreshMs | 0}`.padStart(5);
      let message = `\x1b[7m  Emulator speed: ${kips} kips  \x1b[27m`.padEnd(30);
      process.stdout.write(`${message}\r`);

      countPrev = count;

    }, refreshMs);

  }

  async function testErrorCode() {

    await untilScreenText('A:\\>    ');

    await new Promise((resolve, reject) => {
      let output = '';

      emulator.add_listener('serial0-output-char', function handleSerial(c) {

        // EOF or new line
        if (c === '\x1A' || c === '\n') {

          output = +output;
          emulator.remove_listener('serial0-output-char', handleSerial);

          if (output !== 0) {

            logError(` - Error level: ${output}`);
            drawScreen();

            logInfo('Saving current fda state');
            saveDisk(consts.FILE_FDA_FAILED)
              .then(reject);

          } else {

            logSuccess(' - Success');
            resolve();

          }

        } else {

          output += c;

        }

      });

      sendCommand('echo %ERRORLEVEL% > com1:');
    });

  }

  function drawScreen() {

    const screen = emulator.screen_adapter.get_text_screen();

    if (screen.length < 1) {
      logInfo('Screen has not be initialized yet - nothing to draw');
      return;
    }

    const cols = screen[0].length;

    const title = 'S C R E E N';
    const titlebarLeftSize = 1 + (cols / 2 | 0) - (title.length / 2 | 0);
    const titlebarRightSize = cols + 4 - title.length - titlebarLeftSize;
    const titlebarLeft = Array(titlebarLeftSize).join(' ');
    const titlebarReft = Array(titlebarRightSize).join(' ');
    const titlerow = ` ▐\x1b[7m${titlebarLeft}${title}${titlebarReft}\x1b[27m▌ `;

    screen.unshift(''.padEnd(cols));
    const bottom = Array(cols + 3).join('─');

    const text = `${titlerow}\n │ ${screen.join(' │\n │ ')} │\n └${bottom}┘\n`;

    console.log(''.padEnd(30));
    console.log(text);

  }

  function untilScreenText(str) {

    return new Promise((resolve, reject) => {
      let id;
      let handleChar = function () {

        clearTimeout(id);
        id = setTimeout(() => {

          if (emulator.screen_adapter.get_text_screen().join('\n').includes(str)) {
            emulator.remove_listener('screen-put-char', handleChar);
            resolve();
          }

        }, 0);

      }
      emulator.add_listener('screen-put-char', handleChar);
      handleChar();
    });

  }

  async function sendCommand(command) {

    logInfo(`Command: ${command}`);
    await untilScreenText(`A:\\>    `);
    let sent = '';

    for (let c of command) {
      emulator.keyboard_send_text(c);
      sent += c;
      await untilScreenText(`A:\\>${sent}    `);
    }

    emulator.keyboard_send_text('\n');

  }

  async function transferDirectory(dir, dest) {

    await sendCommand(`mkdir ${dest}`);
    await untilScreenText(`A:\\>    `);

    const files = await readdir(dir);

    for (let filename of files) {

      const filePath = path.resolve(dir, filename);
      const fileStat = await stat(filePath);
      const fileDest = `${dest}\\${filename.toUpperCase()}`;

      if (fileStat.isDirectory())
        await transferDirectory(filePath, fileDest);
      else
        await sendTextFile(filePath, fileDest);
    }

  }

  async function sendTextFile(source, destination) {

    await sendCommand(`copy com1: ${destination}`);

    const text = await readFile(source, { encoding: 'utf8' });
    logInfo(`Serial send text file: ${path.relative('', source)} (${text.length} bytes)`);

    for (let c of text) {
      if (c === '\x1A') break;
      emulator.serial0_send(c);
    }

    // Send EOF
    emulator.serial0_send('\x1A');

    await untilScreenText(`A:\\>    `);

  }

  async function retrieveBinaryFile(source, destination) {

    await sendCommand(`base64 ${source} > com1:`);
    let base64 = '';

    await new Promise((resolve, reject) => {
      emulator.add_listener('serial0-output-char', function handleSerial(c) {

        if (c == '\n') {

          resolve();
          emulator.remove_listener('serial0-output-char', handleSerial);

        } else {

          base64 += c;

        }

      });
    });

    await testErrorCode();
    await writeFile(destination, Buffer.from(base64, 'base64'));

  }

}

process.on('unhandledRejection', up => {
  throw up;
});

build();
