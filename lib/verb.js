const { edictCodes, conjugations } = require('../config/verb.json');
const _ = require('lodash');

function getConjugations(dictionaryForm, edictCode) {
    if (!edictCode) {
        return null;
    }

    return _.mapValues(conjugations, (table) => {
        const ending = table[edictCode] || '';

        // suru and kuru transform rather than conjugate
        if (edictCode === 'vs' || edictCode === 'vk') {
            return ending;
        }

        return dictionaryForm.slice(0, -1) + ending;
    });
}


function getEdictCode(typeDescription) {
    const normalisedDescription = typeDescription.toLowerCase().replace(/['"]/g, '');
    return _.findKey(edictCodes, value => (value === normalisedDescription));
}


module.exports = {
    getConjugations,
    getEdictCode
}
