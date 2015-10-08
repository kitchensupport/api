'use strict';

// use full ES6 everywhere else
require('babel/register');

// work harder
const cluster = require('cluster');
const os = require('os');
const server = require('./server');

const cores = os.cpus().length;
const port = process.env.PORT || 8000;
const production = process.env.NODE_ENV === 'production';

if (cluster.isMaster && production) {
    for (let i = 0; i < cores; i++) {
        cluster.fork();
    }

    cluster.on('online', (worker) => {
        console.log(`START: worker ${worker.id} (process ${worker.process.pid}) is online on port ${port}`);
    });

    cluster.on('exit', (worker, code, signal) => {
        console.error(`ERROR: worker ${worker.process.pid} exited (${signal}, code: ${code}). Restarting...`);
        cluster.fork();
    });
} else {
    server.listen(port);
}
