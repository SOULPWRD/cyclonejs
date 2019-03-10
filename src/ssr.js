function init() {
    "use strict";

    const path = require("path");
    const url = require("url");
    const xs = require("xstream").default;
    const {run} = require("@cycle/run");
    const {html, head, title, body, div} = require("@cycle/dom");
    const {makeHTMLDriver} = require("@cycle/html");

    function ssr(spec) {
        const root_dir = spec.root_dir;

        function virtual_html([vtree]) {
            return (
                html([
                    head([
                        title("Hello from cyclejs")
                    ]),
                    body([
                        div([vtree])
                    ])
                ])
            );
        }

        function prepend_html_doctype(html) {
            return (`
                <!DOCTYPE html>
                ${html}
            `);
        }

        function load_app(url_path) {
            const parsed_url = url.parse(url_path);
            const path_name = parsed_url.pathname;
            const app_path = path.join(root_dir, path_name);
            return require(app_path);
        }

        function with_app(app_fn, context$) {
            return function app(sources) {
                const vdom$ = app_fn(sources).DOM;
                const wrappedVDOM$ = xs
                    .combine(vdom$, context$)
                    .map(virtual_html)
                    .last();

                return {
                    DOM: wrappedVDOM$
                };
            };
        }

        function render_to_html(cb, {url}) {
            let app;
            try {
                app = load_app(url);
            } catch (e) {
                // handle error
                console.log({e});
                return cb(undefined, e);
            }

            const context$ = xs.of({url});
            const app_fn = with_app(app, context$);

            run(app_fn, {
                DOM: makeHTMLDriver(function (html) {
                    const html_string = prepend_html_doctype(html);
                    // side effect
                    cb(html_string);
                }),
                context: () => context$,
                PreventDefault: function () {}
            });
        }

        return Object.freeze({
            render_to_html
        });
    }

    return Object.freeze(ssr);
}

module.exports = init();