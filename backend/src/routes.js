'use strict';

const { uid, randomIntBetween } = require('./utils');

exports.totalDistance = (route, cityData) => {
    let distance = 0;
    for (let i = 0; i < route.length; i++) {
        const originIndex = route[i];
        // Wrap around to the beginning of the route if necessary.
        const destinationIndex = route[(i + 1) % route.length];

        distance += cityData.distances[originIndex][destinationIndex];
    }
    return distance;
};

exports.generateChild = (parentRoute, cityData) => {
    const oldPath = parentRoute.route;
    const numCities = oldPath.length;
    const [i, j] = chooseSwapRange(numCities);
    // The new "mutated" path is the old path with the "middle section"
    // (`slice(i, j)`) reversed. This implements a very simple TSP mutation
    // technique known as 2-opt (https://en.wikipedia.org/wiki/2-opt).
    const newPath = [
        ...oldPath.slice(0, i),
        ...oldPath.slice(i, j).reverse(),
        ...oldPath.slice(j),
    ];
    const length = exports.totalDistance(newPath, cityData);
    const routeId = uid();
    const runId = parentRoute.runId;
    const generation = parentRoute.generation + 1;
    const runIdAndGeneration = runId + '#' + generation;
    return {
        routeId,
        runIdAndGeneration,
        runId,
        generation,
        length,
        route: newPath,
    };
};

// Just as a note: I changed the implementation of this function from what was
// provided in the assignment description.
// The provided implementation didn't really treat the array as a cycle; it
// would never generate a swap range that looped around from the end of the
// array back to the start. As a result, it didn't produce a uniform
// distribution of swap ranges.
// (Also, the provided implementation would occasionally choose the entire
// array, or all but one element of the array, to be the swap range; that would
// just reverse the route, which isn't really a meaningful mutation. The new
// implementation avoids this.)
function chooseSwapRange(numCities) {
    if (numCities < 4) {
        throw new RangeError(`Path of length ${numCities} too short to mutate.`);
    }


    // Choose the first point in the swap range (inclusive) and the end
    // of the swap range (exclusive).
    let start, end;
    start = randomIntBetween(0, numCities);
    const lengthOfSectionToSwap = randomIntBetween(2, numCities - 1);
    end = (start + lengthOfSectionToSwap) % numCities;

    // If the swap range wraps around the end of the array, instead choose
    // the swap range to be the complement of the swap range.
    if (start > end) {
        [start, end] = [end, start];
    }

    return [start, end];
}
