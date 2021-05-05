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
import { times, uid } from './utils';

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

    const runId = uid();
    const initialGeneration = 0;
    content.runId.set(runId);
    content.currentGeneration.set(initialGeneration);

    await initializePopulation(runId, initialGeneration, populationSize);
    await runAllGenerations();
    alert("All done! (but there could still be some GUI updates)");
}

async function initializePopulation(runId, generation, populationSize) {
    content.newRoutesList.clear();
    await times(populationSize, async () => {
        const { routeId, length } =
            await ajax.generateRandomRoute(runId, generation);
        content.newRoutesList.add(
            `Generated route ${routeId} with length ${Math.round(length)} meters`,
        );
    });
}

async function runAllGenerations() {
    // TODO
}
