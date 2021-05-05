/**
 * This is the entrypoint for the application.
 */

import $ from 'jquery';
import './index.css';

import * as content from './page/content';
import * as form from './page/form-fields';
import * as map from './page/map';

map.initMap();

$('#run-evolution').on('click', () => {
    // TODO
    // For the moment, we'll just test that everything works.

    const runId = form.getRunId();
    const numGenerations  = form.getNumGenerations();
    const numParents = form.getNumParents();
    const populationSize = form.getPopulationSize();

    content.bestRouteId.clear();
    content.bestRouteId.set('foo');

    content.bestLength.clear();
    content.bestLength.set('bar');

    content.bestPath.clear();
    content.bestPath.set('baz');

    content.bestRouteCities.clear();
    content.bestRouteCities.add('quux');

    content.currentThreshold.clear();
    content.currentThreshold.set('wibbly-wobbly');

    content.currentGeneration.clear();
    content.currentGeneration.set('timey-wimey');

    content.newRoutesList.clear();
    content.newRoutesList.add(`runId: ${typeof runId} ${runId}`);
    content.newRoutesList.add(`numGenerations: ${typeof numGenerations} ${numGenerations}`);
    content.newRoutesList.add(`numParents: ${typeof numParents} ${numParents}`);
    content.newRoutesList.add(`populationSize: ${typeof populationSize} ${populationSize}`);
});
