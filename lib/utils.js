const fs = require("fs");
const readLine = require("readline-sync");
const _ = require("lodash");
const { fetchUrl } = require("fetch");

function fetch(url) {
  return new Promise((resolve, reject) => {
    fetchUrl(url, (error, meta, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

async function concurrentInvoke(array, concurency, fn) {
  let currentIndex = 0;
  const promises = [];
  const results = [];

  function invokeNext() {
    const index = ++currentIndex;

    if (index < array.length) {
      return fn(array[index])
        .then((result) => results.push(result))
        .then(invokeNext);
    }

    return Promise.resolve();
  }

  for (let i = 0; i < concurency; i++) {
    promises.push(invokeNext());
  }

  await Promise.all(promises);
  return results.filter(Boolean);
}

function isDirectoryEmpty(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
    return true;
  }

  return fs.readdirSync(path).length === 0;
}

function confirmClearDirectory(path) {
  const shouldDelete = readLine.keyInYN(
    `${path} is not empty, do you want to clear it?`
  );

  if (!shouldDelete) {
    process.exit(1);
  }

  console.log("");
  fs.rmSync(path, { recursive: true });
  fs.mkdirSync(path);
}

module.exports = {
  concurrentInvoke,
  fetch,
  isDirectoryEmpty,
  confirmClearDirectory,
};
