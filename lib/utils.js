const _ = require('lodash');
const { fetchUrl } = require('fetch');

function fetch(url) {
    return new Promise((resolve, reject) => {
        fetchUrl(url, (error, meta, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body.toString());
            }
        });
    });
}

function concurrentInvoke(array, concurency, fn) {
    let currentIndex = 0;
    const promises = [];
    const results = [];

    function invokeNext() {
        const index = ++currentIndex;

        if (index < array.length) {
            return fn(array[index])
                .then((result) => results.push(result))
                .then(invokeNext);
        }

        return Promise.resolve();
    }


    for (let i = 0; i < concurency; i++) {
        promises.push(invokeNext());
    }

    return Promise.all(promises).then(() => _.filter(results));
}

module.exports = {
    concurrentInvoke,
    fetch
}
