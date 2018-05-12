const fetch = require('fetch');

function fetch(url) {
    return new Promise((resolve, reject) => {
        fetch.fetchUrl(url, (error, meta, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}

function concurrentInvoke(array, concurency, fn) {
    let currentIndex = 0;
    const promises = [];

    function invokeNext() {
        const index = ++currentIndex;

        if (index < array.length) {
            return fn(array[index]).then(invokeNext);
        }

        return Promise.resolve();
    }


    for (let i = 0; i < concurency; i++) {
        promises.push(invokeNext());
    }

    return Promise.all(promises);
}

module.exports = {
    concurrentInvoke,
    fetch
}
