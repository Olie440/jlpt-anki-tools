const { writeFileSync } = require('fs');
const jisho = require('../lib/jisho.js');

const deckPath = process.argv[2];

const promises = Promise.all(
    readFileSync(deckPath, { encoding: 'utf8' })
        .split('\n')
        .map(jisho.findWord)
);

promises.then(words => {
    writeFileSync(`dictionary-${new Date().getTime()}.json`, JSON.stringify(words, null, 4));
});