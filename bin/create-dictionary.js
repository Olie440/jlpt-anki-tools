const { writeFileSync } = require('fs');

const jisho = require('../lib/jisho.js');
const utils = require('../lib/utils.js');
const anki = require('../lib/anki.js');

const deckPath = process.argv[2];
const outputPath = process.argv[3];

if (!deckPath || !outputPath) {
    console.log('Usage: node create-dictionary.js [Anki Deck Path] [Output Path]');
    process.exit(1);
}

const words = anki.loadFile(deckPath);

console.log('[✓] Loaded Deck');

const wordInformation = utils.concurrentInvoke(words, 10, (word) => {
    return jisho.findWordForLevel(word.kanji, 'n5')
        .then((result) => {
            console.log(`[✓] Fetched ${word.kanji}`);
            return result;
        })
        .catch(() => {
            console.log(`[✘] Unable to find ${word.kanji}`);
            return null;
        });
});

wordInformation.then(words => {
    writeFileSync(outputPath, JSON.stringify(words, null, 4));
});
