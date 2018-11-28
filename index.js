const { readFileSync, writeFileSync } = require('fs');
const jisho = require('./lib/jisho.js');
const dictonary = require('./output/dictionary-missing-words.json');
const _ = require('lodash');

// const promises = Promise.all(
//     readFileSync('example_inputs/list-of-words.txt', { encoding: 'utf8' })
//         .split('\n')
//         .map(jisho.findWord)
// );

// promises.then(words => {
//     const output = dictonary.concat(words);
//     writeFileSync('./output/dictionary-missing-words.json', JSON.stringify(output, null, 4));
// });

const output = _.orderBy(dictonary, 'jlptLevel', 'desc');
writeFileSync('./output/dictionary-missing-words.json', JSON.stringify(output, null, 4));
