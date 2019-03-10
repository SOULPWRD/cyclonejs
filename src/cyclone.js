/*property
    dev, exports, freeze, host, join, log, port, renderToHtml, render_to_html,
    root_dir, ssr, start
*/

function init() {
    "use strict";

    const path = require("path");
    const server = require("./server");
    const ssr_module = require("./ssr");

    function is_root_dir(dir_path) {
        return typeof dir_path === "string";
    }
    const default_root_dir = "/pages";

    function cyclone(spec) {
        const host = spec.host;
        const port = spec.port;
        const root_dir = (
            is_root_dir(spec.root_dir) === true
            ? path.join(spec.root_dir, default_root_dir)
            : "." + default_root_dir
        );

        const dev = spec.dev || false;

        const ssr = ssr_module({
            root_dir
        });

        const http_server = server({
            host,
            port,
            root_dir,
            ssr,
            dev
        });

        return Object.freeze({
            start: http_server.start,
            renderToHtml: ssr.render_to_html
        });
    }

    return Object.freeze(cyclone);
}

module.exports = init();