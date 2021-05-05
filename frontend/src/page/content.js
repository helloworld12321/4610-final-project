/**
 * This file contains helper methods for writing to DOM elements.
 */

import $ from 'jquery';

class TextContent {
    constructor(elementId) {
        this.elementId = elementId;
    }

    set(value) {
        $(this.elementId).text(value);
    }

    clear(value) {
        $(this.elementId).text('');
    }
}

class ListContent {
    constructor(elementId) {
        this.elementId = elementId;
    }

    clear() {
        $(this.elementId).text('');
    }

    add(string) {
        $('<li></li>').text(string).appendTo(this.elementId);
    }
}

export const runId = new TextContent('#run-id');
export const bestRouteId = new TextContent('#best-routeId');
export const bestLength = new TextContent('#best-length');
export const bestPath = new TextContent('#best-path');
export const bestRouteCities = new ListContent('#best-route-cities');
export const currentThreshold = new TextContent('#current-threshold');
export const currentGeneration = new TextContent('#current-generation');
export const newRoutesList = new ListContent('#new-routes-list');
