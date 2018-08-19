const { writeFileSync, accessSync, constants } = require('fs');
const utils = require('./utils');
const sha1 = require('sha1');

const unavailableSha1 = '3277fb7a67dd256e0d239e747a69d0f45cd8d1c0';

function checkPath(path) {
    try {
        accessSync(path, constants.W_OK);
    } catch(e) {
        console.error(`[✘] Unable to write to '${path}'`);
        process.exit(1);
    }
}

function downloadAudio(word, directory = '.') {
    checkPath(directory);

    const { furigana, dictionary } = word.forms;
    let url = `http://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kana=${furigana}`;

    if (dictionary !== furigana) {
        url += `&kanji=${word.dictionary}`
    }

    return utils.fetch(encodeURI(url)).then(file => {
        if (sha1(file) !== unavailableSha1){
            writeFileSync(`${directory}/${dictionary}.mp3`, file);
        } else {
            throw new Error('File not available');
        }
    });
}

module.exports = {
    downloadAudio
}
