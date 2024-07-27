const utils = require("./utils.js");
const verb = require("./verb.js");

const $ = require("cherio");
const _ = require("lodash");

function isDefinition(i, element) {
  const label = $(element).prev().text();

  const isWikipedia = label === "Wikipedia definition";
  const isOtherForms = label === "Other forms";

  return !isWikipedia && !isOtherForms;
}

function extractDefinitions(element) {
  const defintions = element
    .find(".meanings-wrapper > div")
    .filter(isDefinition)
    .find(".meaning-meaning")
    .first()
    .map((_, element) => $(element).text().split("; "))
    .get();

  return defintions;
}

function extractForms(element) {
  const readingsDiv = element.find(".concept_light-readings");

  const dictionary = readingsDiv.find(".text").text().trim();

  // the furigana only appears above kanji,
  // so we need to fill the blanks using the dictionary form
  const furigana = readingsDiv
    .find(".furigana span")
    .map((_, element) => $(element).text())
    .map((index, char) => char || dictionary[index])
    .get()
    .join("");

  return {
    furigana,
    dictionary,
  };
}

function extractEdictCode(element) {
  return verb.getEdictCode(extractTypes(element)[0]);
}

function extractConjugations(element) {
  const edictCode = extractEdictCode(element);
  const dictionaryForm = extractForms(element).dictionary;

  return verb.getConjugations(dictionaryForm, edictCode);
}

function extractTypes(element) {
  return element
    .find(".concept_light .meanings-wrapper > .meaning-tags")
    .first()
    .text()
    .split(", ");
}

function extractJlptLevel(element) {
  return element
    .find(".concept_light-tag.label")
    .filter((_, label) => $(label).text().includes("JLPT N"))
    .first()
    .text();
}

function parseWord(element) {
  if (!element.length) {
    return null;
  }

  return {
    forms: extractForms(element),
    definitions: extractDefinitions(element),
    conjugations: extractConjugations(element),
    types: extractTypes(element),
    edictCode: extractEdictCode(element),
    jlptLevel: extractJlptLevel(element),
  };
}

function parsePage(html) {
  return $(html)
    .find(".concept_light")
    .get()
    .map((element) => parseWord($(element)));
}

function doSearch(term, page) {
  // It redirects if the search beginnings with a plain hash
  let url = encodeURI(`https://jisho.org/search/${term}`).replace("#", "%23");

  if (page) {
    url += `?page=${page}`;
  }

  return utils.fetch(url).then((body) => body.toString());
}

function findWord(word) {
  return doSearch(word)
    .then((html) => $(html).find("#primary .concept_light").first())
    .then(parseWord);
}

function findWordForLevel(word, level) {
  return findWord(`${word} #jlpt-${level} #words`);
}

async function findAllWordsForLevel(level) {
  const firstPage = await doSearch(`#jlpt-${level}`);
  const firstPageResults = parsePage(firstPage);
  const wordCount = $(firstPage)
    .find(".result_count")
    .text()
    .match(/\d+/)
    .map(Number)[0];

  const pages = _.range(1, _.ceil(wordCount / 20) + 1);

  return utils
    .concurrentInvoke(pages, 10, (page) => doSearch(`#jlpt-${level}`, page))
    .then((results) => results.map(parsePage))
    .then((results) => results.concat(firstPageResults))
    .then(_.flatten);
}

module.exports = {
  findWord,
  findWordForLevel,
  findAllWordsForLevel,
};
