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

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
      }
}
exports.ValidationError = ValidationError;

function isUndefined(value) {
    return value === undefined;
}

function isNull(value) {
    return value === null;
}

function exists(value) {
    return value !== undefined && value !== null && value !== '';
}

function isNumeric(value) {
    return Number.isInteger(Number(value));
}

function isNonNegative(value) {
    return Number(value) > 0;
}

function matchesAll(...predicates) {
    return function(value) {
        return predicates.every(p => p(value));
    };
}

function matchesAny(...predicates) {
    return function(value) {
        return predicates.some(p => p(value));
    };
}

function makeCheckerFor(name, predicate) {
    return function check(value) {
        if (!predicate(value)) {
            throw new ValidationError(`Bad input value for "${name}"`);
        }
    };
}

exports.checkRunId = makeCheckerFor('runId', exists);

exports.checkGeneration = makeCheckerFor(
    'generation',
    matchesAll(exists, isNumeric)
);

exports.checkNumToReturn = makeCheckerFor(
    'numToReturn',
    matchesAll(exists, isNonNegative, isNonNegative),
);

exports.checkNumChildren = makeCheckerFor(
    'numChildren',
    matchesAll(
        exists,
        isNumeric,
        isNonNegative,
        (numChildren => numChildren <= 25),
    ),
);

exports.checkLengthStoreThreshold = makeCheckerFor(
    'lengthStoreThreshold',
    matchesAny(
        isUndefined,
        isNull,
        matchesAll(exists, isNumeric, isNonNegative)
    ),
);

exports.checkRouteId = makeCheckerFor('routeId', exists);
