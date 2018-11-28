const { writeFileSync, readdirSync } = require('fs');

const anki = require('../lib/anki.js');
const japanesepod101 = require('../lib/japanesepod101.js');
const utils = require('../lib/utils.js');
const outputDir = './output/deck';
const words = require('../output/dictionary-missing-words.json');
console.log('[✓] Loaded Deck');

const download = utils.concurrentInvoke(words, 10, (word) => {
    return japanesepod101.downloadAudio(word, outputDir)
        .then(() => {
            console.log(`[✓] Audio for ${word.forms.dictionary} downloaded`);
        })
        .catch(() => {
            console.log(`[✘] Audio for ${word.forms.dictionary} unavailable`);
        });
});

download.then(() => {
    console.log('[✓] Audio for all words downloaded');

    const files = readdirSync(outputDir);
    const output = words.map(word => {
        const hasAudio = files.includes(`${word.forms.dictionary}.mp3`);
        const row = [
            word.forms.dictionary,
            word.forms.furigana,
            word.definitions.join(', ')
        ];

        if (hasAudio) {
            row.push(`[sound:${word.forms.dictionary}.mp3]`);
        } else {
            row.push('');
        }

        return row.join('\t');
    });

    console.log('[✓] Audio added to end of deck data');

    writeFileSync(outputDir + '/deck.txt', output.join('\n'));

    console.log('[✓] Deck written to file');
});
