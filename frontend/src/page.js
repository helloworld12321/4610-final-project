/**
 * This file contains helper methods for reading from and writing to the DOM.
 */

import $ from 'jquery';

export function clearNewRouteList() {
    $('#new-route-list').text('');
}

export function addNewRouteToList(string) {
    $('<li></li>').text(string).appendTo('#new-route-list');
}

export const form = {
    getRunId() {
        const runId = $('#run-id-text-field').val();
        if (runId === '') {
            throw `Bad value for "${labelOf('run-id-text-field')}"`;
        } else {
            return runId
        }
    },

    getGeneration() {
        const inputString = $('#generation-text-field').val()
        const generation = Number($('#generation-text-field').val());
        if (
            inputString === ''
            || !Number.isInteger(generation)
        ) {
            throw `Bad value for "${labelOf('generation-text-field')}"`;
        } else {
            return generation;
        }
    },

    getNumToGenerate() {
        const inputString = $('#num-to-generate').val()
        const numToGenerate = Number($('#num-to-generate').val());
        if (
            inputString === ''
            || !Number.isInteger(numToGenerate)
            || numToGenerate < 0
        ) {
            throw `Bad value for "${labelOf('num-to-generate')}"`;
        } else {
            return numToGenerate;
        }
    },

    getNumBestToGet() {
        const inputString = $('#num-best-to-get').val()
        const numBestToGet = Number($('#num-best-to-get').val());
        if (
            inputString === ''
            || !Number.isInteger(numBestToGet)
            || numBestToGet < 0
        ) {
            throw `Bad value for "${labelOf('num-best-to-get')}"`;
        } else {
            return numBestToGet;
        }
    },

    getRouteId() {
        const routeId = $('#route-id').val();
        if (routeId === '') {
            throw `Bad value for "${labelOf('route-id')}"`;
        } else {
            return routeId;
        }
    },
}

function labelOf(elementId) {
    // Trim training colons, if present.
    return $(`label[for=${elementId}]`).text().replace(/:?\s*$/, '');
}
