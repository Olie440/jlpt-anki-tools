const anki = require('../lib/anki.js');
const japanesepod101 = require('../lib/japanesepod101.js');
const utils = require('../lib/utils.js');

const deckPath = process.argv[2];
const outputDir = process.argv[3];

const words = anki.loadFile(deckPath)

utils.concurrentInvoke(words, 10, (word) => {
    return japanesepod101.downloadAudio(word.kana, outputDir);
});
