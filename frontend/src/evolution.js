/**
 * This is the file that runs and manages all the evolutionary computation.
 *
 * (It's also in charge of writing the results of that evolutionary computation
 * to the DOM.)
 */

import * as content from './page/content';
import * as form from './page/form-fields';
import * as map from './page/map';
import * as ajax from './ajax';
import { delay, times, uid } from './utils';

export async function runEvolution() {
    let populationSize, numParents, numGenerations;
    try {
        populationSize = form.getPopulationSize();
        numParents = form.getNumParents();
        numGenerations = form.getNumGenerations();
    } catch (formProblem) {
        alert(formProblem);
        return;
    }

    content.bestLength.clear();
    content.bestPath.clear();
    content.bestRouteId.clear();
    content.bestRouteCities.clear();

    const runId = uid();
    content.runId.set(runId);
    content.currentGeneration.set(0);

    const cityData = await ajax.getCityData();
    map.initCities(cityData);

    const { initialBest } = await initializePopulation(
        runId,
        populationSize,
    );
    displayBestRoute(initialBest.routeId, cityData);

    let allTimeBestRoute = initialBest;

    for (let generation = 1; generation <= numGenerations; generation++) {
        const { bestOfGeneration } = await runGeneration(
            runId,
            generation,
            populationSize,
            numParents,
        );
        if (bestOfGeneration.length < allTimeBestRoute.length) {
            allTimeBestRoute = bestOfGeneration;
            await displayBestRoute(bestOfGeneration.routeId, cityData);
        }
    }
    alert("All done! (but there could still be some GUI updates)");
}

async function initializePopulation(runId, populationSize) {
    content.newRoutesList.clear();
    const population = await times(populationSize, async () => {
        const { routeId, length } = await ajax.generateRandomRoute(runId, 0);
        content.newRoutesList.add(
            `Generated route ${routeId} with length ${Math.round(length)} meters`,
        );
        return { routeId, length };
    });

    population.sort((a, b) => a.length - b.length);
    return { initialBest: population[0] };
}

async function runGeneration(runId, generation, populationSize, numParents) {
    // Wait five seconds before starting each generation. (This is kind of a
    // hack to make sure that DynamoDB reaches eventual consistency before we
    // proceed.)
    await delay(5000);
    content.newRoutesList.clear();
    content.bestRoutesList.clear();
    content.currentThreshold.clear();
    content.currentGeneration.set(generation);

    const bestRoutes = await ajax.getBestRoutes(
        runId,
        generation - 1,
        numParents,
    );
    for (const { routeId, length } of bestRoutes) {
        content.bestRoutesList.add(
            `Route ${routeId} with length ${Math.round(length)} meters`,
        );
    }
    if (bestRoutes.length === 0) {
        const errorMessage =
            'We got no best routes back. We probably overwhelmed the write capacity for the database.';
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    // Tell the server not to bother storing any route that's longer than the
    // longest parent.
    const lengthStoreThreshold = bestRoutes[bestRoutes.length - 1].length;
    content.currentThreshold.set(lengthStoreThreshold);

    const childRoutes = await generateChildRoutes(
        populationSize,
        bestRoutes,
        lengthStoreThreshold,
    );
    for (const { routeId, length } of childRoutes) {
        content.newRoutesList.add(
            `Generated route ${routeId} with length ${Math.round(length)} meters`,
        );
    }
    if (childRoutes.length === 0) {
        const errorMessage = 'We generated no child routes this generation.';
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    childRoutes.sort((a, b) => a.length - b.length);
    return { bestOfGeneration: childRoutes[0] };
}

async function generateChildRoutes(
    populationSize,
    parentRoutes,
    lengthStoreThreshold,
) {
    const childrenPerParent = Math.floor(populationSize / parentRoutes.length);
    let childRoutes = await Promise.all(parentRoutes.map(parent =>
        ajax.mutateRoute(
            parent.routeId,
            childrenPerParent,
            lengthStoreThreshold,
        )
    ));
    childRoutes = childRoutes.flat();
    return childRoutes;
}

async function displayBestRoute(newBestRouteId, cityData) {
    const newBestRoute = await ajax.getRouteByIdWithRetries(newBestRouteId, 3);

    content.bestLength.set(newBestRoute.length);
    content.bestPath.set(newBestRoute.route);
    content.bestRouteId.set(newBestRoute.routeId);

    content.bestRouteCities.clear();
    for (const index of newBestRoute.route) {
        const cityName = cityData.cities[index].cityName;
        content.bestRouteCities.add(cityName);
    }

    map.setRoute(newBestRoute.route, cityData);
}
