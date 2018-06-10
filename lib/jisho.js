const utils = require('./utils.js');
const verb = require('./verb.js');

const $ = require('cherio');
const _ = require('lodash');

function isDefinition(i, element) {
    const label =  $(element).prev().text();

    const isWikipedia = (label === 'Wikipedia definition');
    const isOtherForms = (label === 'Other forms');

    return !isWikipedia && !isOtherForms;
}

function extractDefinitions(element) {
    const defintions = element
        .find('.meanings-wrapper > div')
        .filter(isDefinition)
        .find('.meaning-meaning')
        .first()
        .map((_, element) => $(element).text().split('; '))
        .get();

    return defintions;
}

function extractForms(element) {
    const readingsDiv = element.find('.concept_light-readings');

    const dictionary = readingsDiv
        .find('.text')
        .text()
        .trim();

    // the furigana only appears above kanji,
    // so we need to fill the blanks using the dictionary form
    const furigana = readingsDiv
        .find('.furigana span')
        .map((_, element) => $(element).text())
        .map((index, char) => char || dictionary[index])
        .get()
        .join('');

    return {
        furigana,
        dictionary
    }
}

function extractEdictCode(element) {
    return verb.getEdictCode(
        extractTypes(element)[0]
    );
}

function extractConjugations(element) {
    const edictCode = extractEdictCode(element);
    const dictionaryForm = extractForms(element).dictionary;

    return verb.getConjugations(dictionaryForm, edictCode);
}

function extractTypes(element) {
    return element
        .find('.concept_light .meanings-wrapper > .meaning-tags')
        .first()
        .text()
        .split(', ');
}

function parseWord(html) {
    const element = $(html).find('#primary .concept_light').first();

    if (!element.length) {
        return null;
    }

    return {
        forms: extractForms(element),
        definitions: extractDefinitions(element),
        conjugations: extractConjugations(element),
        types: extractTypes(element),
        edictCode: extractEdictCode(element)
    }
}


function doSearch(term) {
    const url = encodeURI(`https://jisho.org/search/${term}`);
    return utils.fetch(url);
}

function findWordForLevel(word, level) {
    return doSearch(`${word} #jlpt-${level} #words`)
        .then(parseWord);
}

module.exports = {
    findWordForLevel
}
