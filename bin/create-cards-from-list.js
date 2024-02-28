const { writeFileSync, readdirSync, readFileSync } = require("fs");

const jisho = require("../lib/jisho.js");
const japanesepod101 = require("../lib/japanesepod101.js");
const utils = require("../lib/utils.js");

const OUTPUT_DIR = "./output/deck";

const deckPath = "./list.txt";

async function convertListToDictionary() {
  const words = await Promise.all(
    readFileSync(deckPath, { encoding: "utf8" }).split("\n").map(jisho.findWord)
  );

  console.log("[✓] Loaded word meta-data");

  const download = utils.concurrentInvoke(words, 10, (word) => {
    return japanesepod101
      .downloadAudio(word, OUTPUT_DIR)
      .then(() => {
        console.log(`[✓] Audio for ${word.forms.dictionary} downloaded`);
      })
      .catch(() => {
        console.log(`[✘] Audio for ${word.forms.dictionary} unavailable`);
      });
  });

  download.then(() => {
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
  });
}

convertListToDictionary();
