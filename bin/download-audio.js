#!/usr/bin/env node
const { program } = require("commander");
const { downloadAudio } = require("../lib/japanesepod101");

const { furigana, dictionary } = program
  .description("Download Audio from JapanesePod 101")
  .requiredOption("--furigana <furigana>", "Kana to use when reading")
  .option("--dictionary <dictionary>", "Dictionary form of the word")
  .parse()
  .opts();

const forms = {
  furigana,
  dictionary: dictionary ?? furigana,
};

downloadAudio({ forms });
