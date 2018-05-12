const { writeFileSync } = require('fs');
const utils = require('./utils');
const sha1 = require('sha1');

const unavailableSha1 = '3277fb7a67dd256e0d239e747a69d0f45cd8d1c0';

async function downloadAudio(word, directory = '.') {
    const url = encodeURI(`http://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kana=${word}`);
    const file = utils.fetch(url);

    if (sha1(file) !== unavailableSha1){
        writeFileSync(`${directory}/${word}.mp3`, file);
    }
}

module.exports = {
    downloadAudio
}
