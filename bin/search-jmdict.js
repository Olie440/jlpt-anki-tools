#!/usr/bin/env node
const { loadDictionary } = require("../lib/jmdict");

const DICTIONARY = loadDictionary();

const searchTerm = process.argv[2];

const matches = DICTIONARY.words.filter(
  (word) => matchesSearchTerm(word.kanji) || matchesSearchTerm(word.kana)
);

function matchesSearchTerm(allForms) {
  return allForms.filter((form) => form.text === searchTerm).length;
}

console.log(JSON.stringify(matches));
