const { writeFileSync, accessSync, constants } = require("fs");
const utils = require("./utils");
const sha1 = require("sha1");

const UNAVAILABLE_SHA1 = "3277fb7a67dd256e0d239e747a69d0f45cd8d1c0";

function checkPath(path) {
  try {
    accessSync(path, constants.W_OK);
  } catch (e) {
    console.error(`[✘] Unable to write to '${path}'`);
    process.exit(1);
  }
}

async function downloadAudio(word, directory = ".") {
  checkPath(directory);

  if (!word?.forms) {
    throw new Error("Word form information missing");
  }

  const { furigana, dictionary } = word.forms;
  let url = `http://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kana=${furigana}`;

  if (dictionary !== furigana) {
    url += `&kanji=${dictionary}`;
  }
  const file = await utils.fetch(encodeURI(url));

  if (sha1(file) === UNAVAILABLE_SHA1) {
    throw new Error("File not available");
  }

  writeFileSync(`${directory}/${dictionary}.mp3`, file);
}

module.exports = {
  downloadAudio,
};
