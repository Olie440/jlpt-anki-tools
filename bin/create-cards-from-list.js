const { writeFileSync, readdirSync, readFileSync } = require("fs");
const jmdict = require("../lib/jmdict.js");
const japanesepod101 = require("../lib/japanesepod101.js");
const utils = require("../lib/utils.js");

const OUTPUT_DIR = "./output/deck";
const LIST_PATH = "./input/list.txt";
const LIST_OFFSET = 0;
const WORD_LIMIT = 5000;

async function convertListToDictionary() {
  if (!utils.isDirectoryEmpty(OUTPUT_DIR)) {
    utils.confirmClearDirectory(OUTPUT_DIR);
  }

  const words = readFileSync(LIST_PATH, { encoding: "utf8" })
    .split("\n")
    .slice(LIST_OFFSET, LIST_OFFSET + WORD_LIMIT)
    .map(jmdict.findDefinition)
    .filter(Boolean);

  console.log("[✓] Found words in dictionary");

  await utils.concurrentInvoke(words, 8, async (word) => {
    try {
      await japanesepod101.downloadAudio(word, OUTPUT_DIR);
      console.log(`[✓] Audio for ${word.forms.dictionary} downloaded`);
    } catch {
      console.log(`[✘] Audio for ${word.forms.dictionary} unavailable`);
    }
  });

  console.log("[✓] Audio for all words downloaded");

  const files = readdirSync(OUTPUT_DIR);
  const output = words.map((word) => {
    const hasAudio = files.includes(`${word.forms.dictionary}.mp3`);
    const row = [
      word.forms.dictionary,
      word.forms.furigana,
      word.definitions.join(", "),
    ];

    if (hasAudio) {
      row.push(`[sound:${word.forms.dictionary}.mp3]`);
    } else {
      row.push("");
    }

    return row.join("\t");
  });

  console.log("[✓] Audio added to end of deck data");

  writeFileSync(OUTPUT_DIR + "/deck.txt", output.join("\n"));

  console.log("[✓] Deck written to file");
}

convertListToDictionary();
