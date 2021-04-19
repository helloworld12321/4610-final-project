/**
 * This is the entrypoint for the application.
 */

import $ from 'jquery';
import { promise as queue } from 'fastq';
import { makeRandomRoutes } from './random-routes';
import { getBestRoutes } from './best-routes';
import { getRouteById } from './get-route-by-id';
import './index.css';

const buttons = [
    { id: '#generate-random-routes', handler: makeRandomRoutes },
    { id: '#get-best-routes', handler: getBestRoutes },
    { id: '#get-route-by-id', handler: getRouteById },
];

// This is an important point--we don't want two copies of a handler running at
// the same time. (If the user clicks a button twice in quick succession, the
// second handler should wait for the first one to finish.)
// To regulate this, we need one task queue per button. Each button press will
// add a task to that queue.
const queues = {};

for (const { id, handler } of buttons) {
    queues[id] = queue(handler, 1);

    // Note that because of how `const` variables are scoped, we don't have to
    // worry about the old "creating a closure in a for loop" issue.
    // (See: https://stackoverflow.com/a/750506)
    $(id).on('click', () => {
        queues[id].push();
    });
}
