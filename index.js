const jisho = require('./lib/jisho.js');
const word = process.argv[2];

jisho.findWordForLevel(word, 'n5').then(console.log);
