import $ from 'jquery';
import './index.css';

const baseUrl = 'https://08noe16b16.execute-api.us-east-1.amazonaws.com/Prod';
console.log(`The base URL is ${baseUrl}.`);

// Set up the functions to be called when the user clicks on any
// of the three buttons in our (very simple) user interface.
$('#generate-random-routes').on('click', makeRandomRoutes);
$('#get-best-routes').on('click', getBestRoutes);
$('#get-route-by-id').on('click', getRouteById);

/**
 * Generates a collection of new routes, where the number to generate (and the
 * runId and generation) are specified in the HTML text fields. Note that we
 * don't do any kind of sanity checking here, when it would make sense to at
 * least ensure that `numToGenerate` is a non-negative number.
 */
function makeRandomRoutes() {
    const runId = $('#runId-text-field').val();
    const generation = $('#generation-text-field').val();
    const numToGenerate =$('#num-to-generate').val();
    // Reset the contents of `#new-route-list` so that it's ready for
    // `showRoute()` to "fill" it with the incoming new routes.
    $('#new-route-list').text('');
    for (let i = 0; i < numToGenerate; i++) {
        makeOneRandomRoute(runId, generation)
          .done(showNewRoute)
          .fail(showErrorMakingRoute);
    }
}

/**
 * This generates a single random route by POSTing the runId and generation to
 * the `/routes` endpoint. It's asynchronous (like requests across the network
 * typically are), and the showRoute() function is called when the request
 * response comes in.
 */
function makeOneRandomRoute(runId, generation) {
    return $.ajax({
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
    $('<li></li>')
        .text(`Generated route ${routeId} with length ${length}`)
        .appendTo('#new-route-list');
}

/**
 * When a request for a new route completes unsuccessfully, add an element to
 * the `#new-route-list` with an error message.
 */
function showErrorMakingRoute(xhr, _, errorThrown) {
    console.error(`Error generating random route: ${errorThrown}`);
    console.error(`Response: ${xhr.responseText}`);
    $('<li></li>').text(`Error: ${errorThrown}`).appendTo('#new-route-list');
}

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
