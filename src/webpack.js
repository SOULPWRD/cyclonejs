/*property
    HotModuleReplacementPlugin, compiler, config, dev, dev_middleware,
    dist_path, entry, exports, filename, files, freeze, hot_middleware, output,
    path, plugins
*/

function init() {
    "use strict";
    const path = require("path");
    const webpack = require("webpack");
    const webpack_dev_middleware = require("webpack-dev-middleware");
    const webpack_hot_middleware = require("webpack-hot-middleware");

    function webpack_module(spec) {
        const is_dev = spec.dev;
        const root_dir = spec.root_dir;
        const dist_path = spec.dist_path || "dist";
        const files = spec.files || [];
        const move_on = true;

        const core_plugins = [];

        const watch_options = {
            aggregateTimeout: 300,
            ignored: /node_modules/
        };

        function create_config() {
            const config = {
                entry: (
                    is_dev
                    ? [
                        "webpack-hot-middleware/client",
                        ...files
                    ]
                    : [
                        ...files
                    ]
                ),
                output: {
                    path: path.resolve(root_dir, dist_path),
                    filename: "[name].bundle.js"
                },
                plugins: (
                    is_dev
                    ? [
                        ...core_plugins,
                        new webpack.HotModuleReplacementPlugin()
                    ]
                    : [
                        ...core_plugins
                    ]
                ),
                mode: (
                    is_dev === true
                    ? "development"
                    : "production"
                ),
                watch: (
                    is_dev === true
                    ? true
                    : false
                ),
                watchOptions: (
                    is_dev === true
                    ? watch_options
                    : {}
                ),
                devtool: (
                    is_dev === true
                    ? "inline-source-map"
                    : false
                ),
                optimization: {
                    runtimeChunk: "single",
                    splitChunks: {
                        cacheGroups: {
                            vendor: {
                                test: /[\\/]node_modules[\\/]/,
                                name: "vendor",
                                chunks: "all"
                            }
                        }
                    }
                },
                stats: 'errors-only'
            };

            return config;
        }

        function create_compiler() {
            const config = create_config();
            return webpack(config);
        }

        function dev() {
            const config = create_config();
            const compiler = webpack(config);

            const dev_middleware_handler = webpack_dev_middleware(compiler, {});
            const hot_middleware_handler = webpack_hot_middleware(compiler, {});

            function dev_middleware(req, res) {
                return function (next) {
                    dev_middleware_handler(req, res, function (err) {
                        if (err) {
                            return next(undefined, err);
                        }

                        return next(move_on);
                    });
                };
            }

            function hot_middleware(req, res) {
                return function (next) {
                    hot_middleware_handler(req, res, function (err) {
                        if (err) {
                            return next(undefined, err);
                        }

                        return next(move_on);
                    });
                };
            }

            return Object.freeze({
                dev_middleware,
                hot_middleware
            });
        }

        function build() {
            const config = create_config();
            webpack(config, function (err, stats) {
                if (err) {
                    return next(undefined, err);
                }

                console.log("Webpack compilation has successfully finished.")
            });
        }

        return Object.freeze({
            create_config,
            create_compiler,
            dev,
            build
        });
    }

    return Object.freeze(webpack_module);
}

module.exports = init();