import $ from 'jquery';

/**
 * A function that wraps jquery.ajax in a promise.
 */
export function ajaxPromise(...args) {
    return new Promise((resolve, reject) => {
        $.ajax(...args).done((data, textStatus, jqXhr) =>
            resolve({data, textStatus, jqXhr})
        ).fail((jqXhr, textStatus, errorThrown) =>
            reject({jqXhr, textStatus, errorThrown})
        );
    });
}

/**
 * Generate a unique identifier.
 *
 * (Ie, a long random identifier.)
 */
export function uid() {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(16));

    const randomBytesAsHex = Array.from(randomBytes).map(byte =>
        byte.toString(16).padStart(2, '0')
    );

    return randomBytesAsHex.join('');
};

/**
 * Run `n` concurrent copies of a function `asyncFunction` that returns a
 * promise.
 *
 * Return a promise that resolves once all copies of the original function have
 * resolved.
 */
export function times(n, f) {
    const promises = [];
    for (let i = 0; i < n; i++) {
        promises.push(f())
    }
    return Promise.all(promises);
}
