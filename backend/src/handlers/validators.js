'use strict';

/**
 * This file contains some shared validation logic for API parameters.
 *
 * You can use it with query parameters, path parameters, or data in the
 * request body.
 *
 * If a function detects a validation problem, it will throw a string.
 * Otherwise, it will return normally.
 */

exports.checkRunId = (runId) => {
    if (
        runId === undefined
        || runId == null
        || runId === ''
    ) {
        throw 'Bad input value for "runId"';
    }
};

exports.checkGeneration = (generation) => {
    if (
        generation === undefined
        || generation === null
        || generation === ''
        || !Number.isInteger(Number(generation))
    ) {
        console.log('Hi!');
        throw 'Bad input value for "generation"';
    }
};

exports.checkNumToReturn = (numToReturn) => {
    if (
        numToReturn === undefined
        || numToReturn === null
        || numToReturn === ''
        || !Number.isInteger(Number(numToReturn))
        || Number(numToReturn) < 0
    ) {
        throw 'Bad input value for "numToReturn"';
    }
};
