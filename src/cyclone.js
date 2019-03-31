/*property
    dev, exports, files, freeze, get_files, host, join, port, renderToHtml,
    render_to_html, root_dir, sequence, ssr, start, webpack
*/

function init() {
    "use strict";

    const path = require("path");
    const server = require("./server");
    const ssr_module = require("./ssr");
    const webpack_module = require("./webpack");
    const utils = require("./utils");
    const parseq = require("./parseq");

    function is_root_dir(dir_path) {
        return typeof dir_path === "string";
    }

    const default_public_path = "/static";

    function cyclone(spec) {
        const host = spec.host;
        const port = spec.port;
        const root_dir = spec.root_dir;
        const pages_root_dir = path.join(root_dir, "pages");

        const dev = spec.dev || false;
        const ssr = ssr_module({root_dir, pages_root_dir});

        function init_cyclone(next, files) {
            const webpack = webpack_module({dev, root_dir, files});
            const http_server = server({
                host,
                port,
                root_dir,
                ssr,
                dev,
                webpack
            });

            http_server.start(function (err) {
                if (err) {
                    next(undefined, err);
                }

                next(true);
            });
        }

        function start(cb) {
            return parseq.sequence([
                utils.get_files(`${pages_root_dir}/**/*.js`), // @todo add pattern
                init_cyclone
            ])(cb);
        }

        function build() {
            return parseq.sequence([
                utils.get_files(`${pages_root_dir}/**/*.js`),
            ])(function (files, reason) {
                if (reason) {
                    // handler error
                    throw reason;
                }
                webpack_module({dev: false, root_dir, files}).build();
            });
        }

        return Object.freeze({
            start,
            build,
            renderToHtml: ssr.render_to_html
        });
    }

    return Object.freeze(cyclone);
}

module.exports = init();