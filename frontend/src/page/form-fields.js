/**
 * This file contains functions for reading from the inputs in the HTML.
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

export function getNumParents() {
    const numParents = parseInt($('#num-parents').val());
    if (isNaN(numParents) || numParents < 1) {
        throw `Bad value for ${labelOf('num-parents')}`
    } else {
        return numParents;
    }
}

export function getNumGenerations() {
    const numGenerations = parseInt($('#num-generations').val());
    if (isNaN(numGenerations) || numGenerations < 1) {
        throw `Bad value for ${labelOf('num-generations')}`;
    } else {
        return numGenerations;
    }
}

function labelOf(elementId) {
    // Trim training colons, if present.
    return $(`label[for=${elementId}]`).text().replace(/:?\s*$/, '');
}
