#!/usr/bin/env node

const fs = require("fs");

function readDirContents(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, contents) => {
      if (err) {
        reject(err);
      }
      resolve(contents);
    });
  });
}

function getFileStats(file) {
  const stats = fs.lstatSync(file);
  const maxSize = process.argv[3];
  if (stats.size > maxSize) {
    return { path: file, size: stats.size };
  }
  return null;
}

async function getDirContents(dir) {
  try {
    const contents = await readDirContents(dir);
    const fileStats = [];

    for (const item of contents) {
      const path = `./${dir}/${item}`;
      const stats = fs.lstatSync(path);
      if (stats.isFile()) {
        const fileInfo = getFileStats(path);
        if (fileInfo !== null) {
          fileStats.push(fileInfo);
        }
      } else {
        const subStats = await getDirContents(path);
        fileStats.push(...subStats);
      }
    }
    return fileStats;
  } catch (e) {
    throw e;
  }
}

async function main() {
  if (process.argv.length < 4) {
    console.log("Please provide a directory to read and a max file size in bytes in that order.");
    process.exit(1);
  } else {
    try {
      const dir = process.argv[2];
      const stats = await getDirContents(dir);
      const maxSize = process.argv[3];
      console.log(`The following files exceeded the max size of ${maxSize} bytes provided:`);
      stats.forEach(stat => {
        console.log(`Path: ${stat.path}, Size: ${stat.size} bytes.`);
      });
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
}

main();
