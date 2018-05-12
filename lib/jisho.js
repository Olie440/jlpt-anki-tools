const utils = require('./utils.js');

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
        .map(element => $(element).text().split('; '))
        .get();

    return _.flatten(defintions);
}

function parseWord(html) {
    const element = $(html).find('#primary .exact_block .concept_light').first();

    if (!element.length) {
        return null;
    }

    return {
        definitions: extractDefinitions(element)
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
