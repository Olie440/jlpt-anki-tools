const { readFileSync } = require('fs');

function parseFile(data) {
    return data
        .split('\n')
        .map(row => row.split('\t'))
        .map(row => (
            {
                kanji: row[0],
                raw: row
            }
        ));
}

function loadFile(path) {
    const data = readFileSync(path, 'utf8');

    if (data.length) {
        return parseFile(data);
    }

    return null;
}

module.exports = {
    loadFile
}
