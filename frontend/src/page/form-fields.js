/**
 * This file contains functions for reading from the inputs in the HTML.
 *
 * Note that we perform validation when reading user input, but not when
 * setting field values programatically.
 */

import $ from 'jquery';

export function getPopulationSize() {
    const populationSize = parseInt($('#population-size').val());
    if (isNaN(populationSize) || populationSize < 1) {
        throw `Bad value for "${labelOf('population-size')}"`;
    } else {
        return populationSize;
    }
}

export function setPopulationSize(number) {
    $('#population-size').val(number);
}

export function getNumParents() {
    const numParents = parseInt($('#num-parents').val());
    if (isNaN(numParents) || numParents < 1) {
        throw `Bad value for ${labelOf('num-parents')}`
    } else {
        return numParents;
    }
}

export function setNumParents(number) {
    $('#num-parents').val(number);
}

export function getNumGenerations() {
    const numGenerations = parseInt($('#num-generations').val());
    if (isNaN(numGenerations) || numGenerations < 1) {
        throw `Bad value for ${labelOf('num-generations')}`;
    } else {
        return numGenerations;
    }
}

export function setNumGenerations(number) {
    $('#num-generations').val(number);
}

function labelOf(elementId) {
    // Trim training colons, if present.
    return $(`label[for=${elementId}]`).text().replace(/:?\s*$/, '');
}
