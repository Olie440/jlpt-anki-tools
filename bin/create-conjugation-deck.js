const { writeFileSync } = require('fs');
const _ = require('lodash');
const dictionary = require('../output/dictionary-missing-words.json');

function createDeckRow(word) {
    const row = [
        word.forms.dictionary,
        word.forms.furigana,
        word.edictCode,
        word.types[0],
        word.conjugations.negative,
        word.conjugations.polite,
        word.conjugations.te
    ];

    return row.join(';');
}

const outputPath = process.argv[3];

if (!outputPath) {
    console.log('Usage: node create-conjugation-deck.js [Output Path]');
    process.exit(1);
}

const result = _.chain(dictionary)
    .filter('edictCode')
    .map(createDeckRow)
    .join('\n')
    .valueOf();

writeFileSync(outputPath, result);
