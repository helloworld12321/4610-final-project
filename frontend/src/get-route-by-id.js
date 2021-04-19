/**
 * This file contains methods for searching for a route in the database by ID.
 */

import { ajaxPromise } from './utils';
import * as page from './page';
import { baseUrl } from './config';

/**
 * Make a `GET` request that gets all the route information for the given
 * `routeId`.
 *
 * The form of the `GET` request is:
 *   …/routes/:routeId
 *
 * This request will return a complete route JSON object.
 *
 * You should display the returned information in `#route-by-id-elements`
 * (after clearing it first).
 */
export async function getRouteById() {
    let routeId;
    try {
        routeId = page.form.getRouteId();
    } catch (formProblem) {
        alert(formProblem);
        return;
    }

    page.clearRouteByIdText();

    await ajaxPromise({
        method: 'GET',
        url: `${baseUrl}/routes/${encodeURIComponent(routeId)}`,
    }).then(([responseBody]) =>
        showRoute(responseBody),
    ).catch(([xhr]) =>
        showErrorGettingRoute(xhr),
    );
}

function showRoute(responseBody) {
    page.setRouteByIdText(JSON.stringify(responseBody, null, 2));
}

function showErrorGettingRoute(xhr) {
    console.error(`Error getting route by ID.`);
    console.error(`Response: ${xhr.responseText}`);
    page.setRouteByIdText(`Error: ${xhr.responseText}`);
}
