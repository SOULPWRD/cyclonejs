/*property
    exports, freeze, get_files
*/

function init() {
    "use strict";

    const glob = require("glob");

    function get_files(pattern, options) {
        return function (next) {
            glob(pattern, options, function (err, files) {
                if (err) {
                    return next(undefined, err);
                }

                return next(files);
            });
        };
    }

    return Object.freeze({
        get_files
    });
}

module.exports = init();