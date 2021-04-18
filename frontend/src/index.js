/**
 * This is the entrypoint for the application.
 */

import $ from 'jquery';
import { makeRandomRoutes } from './random-routes'
import './index.css';

// Set up the functions to be called when the user clicks on any
// of the three buttons in our (very simple) user interface.
$('#generate-random-routes').on('click', makeRandomRoutes);
$('#get-best-routes').on('click', getBestRoutes);
$('#get-route-by-id').on('click', getRouteById);

/**
 * Make a `GET` request that gets the K best routes.
 *
 * The form of the `GET` request is:
 *   …/best?runId=…&generation=…&numToReturn=…
 *
 * This request will return an array of
 *   { length: …, routeId: … }
 *
 * You should add each of these to `#best-route-list` (after clearing it
 * first).
 */
function getBestRoutes() {
    alert('You need to implement getBestRoutes()');
}

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
function getRouteById() {
    alert('You need to implement getRouteById()');
}
