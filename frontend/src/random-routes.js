/**
 * This file contains methods for generating random routes.
 */

import { ajaxPromise } from './utils';
import * as page from './page';
import { baseUrl } from './config';

/**
 * Generates a collection of new routes, where the number to generate (and the
 * runId and generation) are specified in the HTML text fields.
 */
export async function makeRandomRoutes() {
    let runId, generation, numToGenerate;
    try {
        runId = page.form.getRunId();
        generation = page.form.getGeneration();
        numToGenerate = page.form.getNumToGenerate();
    } catch (formProblem) {
        alert(formProblem);
        return;
    }

    // Reset the contents of `#new-route-list` so that it's ready for
    // `showRoute()` to "fill" it with the incoming new routes.
    page.clearNewRouteList();

    const promises = [];
    for (let i = 0; i < numToGenerate; i++) {
        const makingARoutePromise = makeOneRandomRoute(
            runId,
            generation,
        ).then(([responseBody]) =>
            showNewRoute(responseBody)
        ).catch(([xhr]) =>
            showErrorMakingRoute(xhr)
        );

        promises.push(makingARoutePromise);
    }
    await Promise.all(promises);
}

/**
 * This generates a single random route by POSTing the runId and generation to
 * the `/routes` endpoint. It's asynchronous (like requests across the network
 * typically are), and the showRoute() function is called when the request
 * response comes in.
 */
function makeOneRandomRoute(runId, generation) {
    return ajaxPromise({
        method: 'POST',
        url: `${baseUrl}/routes`,
        data: JSON.stringify({ runId, generation }),
        contentType: 'application/json',
    });
}

/**
 * When a request for a new route completes successfully, add a `<li>…</li>`
 * element to `#new-route-list` with that routes information.
 */
function showNewRoute(responseBody) {
    console.log(`New route received from API: ${responseBody}`);
    const routeId = responseBody.routeId;
    const length = responseBody.length;
    page.addToNewRouteList(`Generated route ${routeId} with length ${length}`);
}

/**
 * When a request for a new route completes unsuccessfully, add an element to
 * the `#new-route-list` with an error message.
 */
function showErrorMakingRoute(xhr) {
    console.error(`Error generating random route`);
    console.error(`Response: ${xhr.responseText}`);
    page.addToNewRouteList(`Error: ${xhr.responseText}`);
}
