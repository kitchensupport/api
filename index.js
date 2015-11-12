'use strict';

// use full ES6 everywhere else
require('babel/register');

// work harder
const cluster = require('cluster');
const os = require('os');

const cores = os.cpus().length;
const port = process.env.PORT || 8000;
const production = process.env.NODE_ENV === 'production';
const args = process.argv.slice(2);

// set up process defaults
process.env.PGSSLMODE = 'require';

if (cluster.isMaster && false) {
    for (let i = 0; i < cores; i++) {
        cluster.fork();
    }

    cluster.on('online', (worker) => {
        console.log(`LOG: worker ${worker.id} (process ${worker.process.pid}) is online on port ${port}`);
    });

    cluster.on('exit', (worker, code, signal) => {
        console.error(`ERROR: worker ${worker.process.pid} exited (${signal}, code: ${code}). Restarting...`);
        cluster.fork();
    });
} else {
    if (args.length > 0 && args[0] === '-r') {
        require(args[1]);
    } else {
        require('./server').listen(port);
    }
}
