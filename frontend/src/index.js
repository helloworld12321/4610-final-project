/**
 * This is the entrypoint for the application.
 */

import $ from 'jquery';
import { makeRandomRoutes } from './random-routes';
import { getBestRoutes } from './best-routes';
import { getRouteById } from './get-route-by-id';
import './index.css';

// Set up the functions to be called when the user clicks on any
// of the three buttons in our (very simple) user interface.
$('#generate-random-routes').on('click', makeRandomRoutes);
$('#get-best-routes').on('click', getBestRoutes);
$('#get-route-by-id').on('click', getRouteById);
