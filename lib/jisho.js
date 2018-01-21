const fetch = require('fetch');
const $ = require('cherio');
const _ = require('lodash')

function doSearch(term) {
    const url = encodeURI(`https://jisho.org/search/${term}`);

    return new Promise((resolve, reject) => {
        fetch.fetchUrl(url, (error, meta, html) => {
            if (error) {
                reject(error);
            } else {
                resolve(html.toString());
            }
        });
    });
}

function isDefinition(i, element) {
    const label =  $(element).prev().text();

    const isOtherForms = (label === 'Other forms');
    const isWikipedia = (label === 'Wikipedia definition');

    return !isWikipedia && !isOtherForms;
}

function parseDefinitions(element) {
    return element
        .find('.meanings-wrapper > div')
        .filter(isDefinition)
        .find('.meaning-meaning')
        .map((index, element) => $(element).text())
        .get();
}

function parseWord(html) {
    const element = $(html).find('#primary .exact_block .concept_light').first();

    if (!element.length) {
        return null;
    }

    return {
        definitions: parseDefinitions(element)
    }
}

function findWordForLevel(word, level) {
    return doSearch(`${word} #jlpt-${level} #words`)
        .then(parseWord);

}

module.exports = {
    findWordForLevel
}
