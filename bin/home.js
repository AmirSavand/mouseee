const { join } = require('path');
const fse = require('fs-extra');
const { exec } = require('child_process');
const htmlmin = require('htmlmin');
const fs = require('fs');

const root = process.cwd();
const dist = join(root, 'home');
const temp = join(root, 'temp');
const assets = join(root, 'static', 'icon.png');

const deleteDist = () => {
  console.log('> deleteDist');
  if (fse.pathExistsSync(dist)) {
    fse.removeSync(dist);
  }
};

const copyAssets = () => {
  console.log('> copyAssets');
  fse.copySync(assets, join(dist, 'icon.png'), {});
};

const setupTemp = () => {
  console.log('> setupTemp');
  fse.mkdirsSync(temp);
  fse.mkdirsSync(dist);
  fse.copySync(join(root, 'README.md'), join(temp, 'index.md'), {});
};

const compileMD = (callbacks = []) => {
  console.log('> compileMD');
  exec('index-md', (error, stdout, stderr) => {
    if (error || stderr) {
      console.log('Failed to execute index-md');
    }
    if (error) {
      console.log(error.message);
      return;
    }
    if (stderr) {
      console.log(stderr);
      return;
    }
    console.log(stdout);
    for (const callback of callbacks) {
      callback();
    }
  });
};

const minifyHTML = () => {
  console.log('> minifyHTML');
  const html = join(dist, 'index.html');
  const htmlMin = htmlmin(fs.readFileSync(join(dist, 'index.html'), { encoding: 'utf-8' }))
    .replace('<title></title>', '<title>Mouseee</title>')
    .replace(/\n/g, ' ');
  fs.writeFileSync(html, htmlMin);
};

const deleteTemp = () => {
  console.log('> cleanTemp');
  fse.removeSync(temp);
};

deleteDist();
deleteTemp();
copyAssets();
setupTemp();
compileMD([minifyHTML, deleteTemp]);
