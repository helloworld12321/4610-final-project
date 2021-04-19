import $ from 'jquery';

/**
 * A function that wraps jquery.ajax in a promise.
 */
export function ajaxPromise(...args) {
    return new Promise((resolve, reject) => {
        // `resolve` and `reject` only take one argument, so we have give
        // them an array of all of the arguments `done` and `fail` provide.
        $.ajax(...args)
            .done((...outputs) => resolve(outputs))
            .fail((...outputs) => reject(outputs));
    });
}
