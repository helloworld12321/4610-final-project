/**
 * This is the entrypoint for the application.
 */

import $ from 'jquery';

import './index.css';
import * as form from './page/form-fields';
import * as map from './page/map';
import { runEvolution } from './evolution';

map.initMap();

// Set reasonable defaults for the evolution.
form.setPopulationSize(100);
form.setNumParents(20);
form.setNumGenerations(20);

$('#run-evolution').on('click', () => {
    // Disable the button to prevent the user from running several evolutions
    // at once. (See async notes below.)
    $('#run-evolution').prop('disabled', true);
    runEvolution().finally(() => {
        $('#run-evolution').prop('disabled', false);
    });
});

// Async notes:
//
// From some preliminary testing, it looks like, when the user clicks a
// button, they aren't able to click it again until after that button's
// handler's task on the event loop has completed. (For our handler, that
// happens right after we register the "finally" callback with the
// `runEvolution` promise.)
//
// So, if the user clicks the "Run evolution" button, they can't click it
// again until the current evolution is completely done.
//
// They can't click the button again *before* the click handler has finished.
// (The browser prevents that.)
//
// And they can't click the button again *after* the click handler has
// finished. (Because at that point the button will be disabled.)
//
// (I tested this behavior on a Mac in Chrome, Safari, and Firefox.)
