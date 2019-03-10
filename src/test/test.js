const cyclone = require("../cyclone");

const app = cyclone({
    host: "localhost",
    port: 3000,
    dev: false,
    root_dir: __dirname
});

app.start(function (err) {
    if (err) {
        throw new Error(err);
    }

    console.log(`>Server is running on localhost:3000`);
});