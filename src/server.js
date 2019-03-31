/*property
    createServer, dev, dev_middleware, end, exports, freeze, host,
    hot_middleware, https, listen, method, on, port, render_to_html, sequence,
    ssr, start, url, webpack
*/

function init() {
    "use strict";

    const http = require("http");
    const https = require("https");
    const parseq = require("./parseq");
    const default_host = "127.0.0.1";
    const default_port = 3000;

    function server(spec) {
        const ssr = spec.ssr;
        const dev = spec.dev;
        const is_https = spec.https;
        const host = spec.host || default_host;
        const port = spec.port || default_port;
        const webpack = spec.webpack;
        const {dev_middleware, hot_middleware} = webpack.dev();

        const http_server = (
            is_https
            ? https.createServer()
            : http.createServer()
        );

        function request_handler(req, res) {
            if (req.method !== "GET") {
                res.end("Unsupported method");
                return;
            }

            if (dev === true) {
                return parseq.sequence([
                    dev_middleware(req, res),
                    hot_middleware(req, res)
                ])(function (value, reason) {
                    if (value === undefined || reason) {
                        // handle reason
                        return;
                    }

                    ssr.render_to_html(function (html, err) {
                        if (err) {
                            return res.end("Not found");
                        }

                        res.end(html);
                    }, {
                        url: req.url
                    });
                });
            }

            ssr.render_to_html(function (html, err) {
                if (err) {
                    return res.end("Not found");
                }

                res.end(html);
            }, {
                url: req.url
            });
        }

        function start(cb) {
            http_server.on("request", request_handler);
            http_server.listen(port, host, function (err) {
                if (err) {
                    cb(undefined, err);
                    return;
                }

                cb();
            });
        }

        return Object.freeze({
            start
        });
    }

    return Object.freeze(server);
}

module.exports = init();