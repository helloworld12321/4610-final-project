/**
 * This file contains functions for talking to the backend.
 */

import { baseUrl } from './config';
import { ajaxPromise } from './utils';

export async function generateRandomRoute(runId, generation) {
    const { data } = await ajaxPromise({
        method: 'POST',
        url: `${baseUrl}/routes`,
        data: JSON.stringify({ runId, generation }),
        contentType: 'application/json',
    });
    return data;
}
