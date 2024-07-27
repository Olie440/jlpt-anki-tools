const { sortBy, map, findKey } = require("lodash");
const { existsSync, readFileSync } = require("fs");

const verb = require("./verb");

const DICTIONARY_PATH = "./input/jmdict.json";
const DICTIONARY = loadDictionary();

function loadDictionary() {
  if (!existsSync(DICTIONARY_PATH)) {
    throw new Error("Unable to load dictionary");
  }

  return JSON.parse(readFileSync(DICTIONARY_PATH));
}

const KANA_ONLY_REGEX = /^[ぁ-んァ-ン]+$/;

function findDefinition(word) {
  if (KANA_ONLY_REGEX.test(word)) {
    return null;
  }

  const wordInformation = DICTIONARY.words.find(
    (entry) => matchesKanji(word, entry) && !isUnwantedType(entry)
  );

  if (!wordInformation) {
    return null;
  }

  return convertToCommonFormat(wordInformation.sense.at(0), wordInformation);
}

function matchesKanji(word, entry) {
  return entry.kanji.find((kanji) => kanji.text === word);
}

const UNWANTED_EDICT_CODES = [
  findEdictCode("particle"),
  findEdictCode("conjunction"),
  findEdictCode("auxiliary adjective"),
  findEdictCode("suffix"),
  findEdictCode("derogatory"),
  findEdictCode("grammar"),
];

function findEdictCode(descripion) {
  return findKey(DICTIONARY.tags, (value) => value === descripion);
}

function isUnwantedType(entry) {
  const entryEdictCode = getEdictCode(entry.sense.at(0));

  return UNWANTED_EDICT_CODES.includes(entryEdictCode);
}

function convertToCommonFormat(sense, wordInformation) {
  return {
    forms: getForms(sense, wordInformation),
    definitions: getDefinitions(sense),
    conjugations: getConjugations(sense, wordInformation),
    types: getTypes(sense),
    edictCode: getEdictCode(sense),
    jlptLevel: null,
  };
}

function getForms(sense, { kanji, kana }) {
  return {
    dictionary: getDictionaryForm(sense, { kanji, kana }),
    furigana: resolveAppliesTo(sense.appliesToKana, kana),
  };
}

const KANA_ONLY_TAG = "uk";

function getDictionaryForm(sense, { kanji, kana }) {
  return sense.misc.includes(KANA_ONLY_TAG) || !kanji.length
    ? resolveAppliesTo(sense.appliesToKana, kana)
    : resolveAppliesTo(sense.appliesToKanji, kanji);
}

function resolveAppliesTo(appliesTo, allForms) {
  if (appliesTo.at(0) === "*") {
    return getMostCommonForm(allForms);
  }

  const applicableForms = appliesTo.map((appliesToForm) =>
    allForms.find((form) => form.text === appliesToForm)
  );

  return getMostCommonForm(applicableForms);
}

const SORT_UPWARDS = 0;
const SORT_DOWNWARDS = 1;

function getMostCommonForm(allForms) {
  const sortedForms = sortBy(allForms, (form) =>
    form.common ? SORT_UPWARDS : SORT_DOWNWARDS
  );

  return sortedForms.at(0).text;
}

function getDefinitions(sense) {
  return map(sense.gloss, "text");
}

function getConjugations(sense, { kanji, kana }) {
  const edictCode = getEdictCode(sense);
  const dictionaryForm = getDictionaryForm(sense, { kanji, kana });

  return verb.getConjugations(dictionaryForm, edictCode);
}

function getEdictCode(sense) {
  return sense.partOfSpeech.at(0) ?? null;
}

function getTypes(sense) {
  return sense.partOfSpeech
    .map((part) => DICTIONARY.tags[part])
    .filter(Boolean);
}

module.exports = {
  findDefinition,
  loadDictionary,
};
