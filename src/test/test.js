const cyclone = require("../cyclone");

const app = cyclone({
    host: "localhost",
    port: 3000,
    dev: true,
    root_dir: __dirname
});

app.start(function (value, err) {
    if (err) {
        throw new Error(err);
    }

    console.log(`>Server is running on localhost:3000`);
});