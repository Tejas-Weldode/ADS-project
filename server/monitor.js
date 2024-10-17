// server/monitor.js
function setupMonitor(cluster) {
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork(); // Restart the worker
    });

    console.log('Process monitor running...');
}

module.exports = { setupMonitor };
