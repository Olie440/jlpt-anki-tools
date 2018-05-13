const { writeFileSync, readdirSync } = require('fs');

const anki = require('../lib/anki.js');
const japanesepod101 = require('../lib/japanesepod101.js');
const utils = require('../lib/utils.js');

const deckPath = process.argv[2];
const outputDir = process.argv[3];

const words = anki.loadFile(deckPath);
console.log('[✓] Loaded Deck');

const download = utils.concurrentInvoke(words, 10, (word) => {
    return japanesepod101.downloadAudio(word.kana, outputDir)
        .then(() => {
            console.log(`[✓] Audio for ${word.kana} downloaded`);
        })
        .catch(() => {
            console.log(`[✘] Audio for ${word.kana} unavailable`);
        });
});

download.then(() => {
    console.log('[✓] Audio for all words downloaded');

    const files = readdirSync(outputDir);
    const output = words.map(word => {
        const hasAudio = files.includes(`${word.kana}.mp3`);

        if (hasAudio) {
            word.raw.push(`[sound:${word.kana}.mp3]`);
        } else {
            word.raw.push('');
        }

        return word.raw.join('\t');
    });

    console.log('[✓] Audio added to end of deck data');

    writeFileSync(outputDir + '/deck.txt', output.join('\n'));

    console.log('[✓] Deck written to file');
});
