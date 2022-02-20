import fetch from 'isomorphic-fetch';
import pty from 'node-pty';
import minimist from 'minimist';
import Conf from 'conf';
import dotenv from 'dotenv';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
//////////////////////////////////
// Global config
//////////////////////////////////
process.env.DEFAULT_MAX_CPU || "50";
process.env.DEFAULT_MAX_MEMORY || "25";
process.env.DEFAULT_MAX_DISK || "1G";
process.env.DEFAULT_DAEMON_PORT || "8080";
dirname(fileURLToPath(import.meta.url));
const CONTAINER_PREFIX = "vt__";
// export const CENTRAL_SERVER = process.env.CENTRAL_SERVER || "34.133.251.43:8080"
const CENTRAL_SERVER = process.env.CENTRAL_SERVER || "localhost:8080";
//////////////////////////////////
// Persisted config
//////////////////////////////////
new Conf({ projectName: "vt100-cli" });

/**
 *
 * This "MetricDaemon" or "DaemonMetric" runs only on the Donor side
 */
const argv = minimist(process.argv.slice(2));
const MAX_CPU = argv["max-cpu"];
const MAX_MEMORY = argv["max-memory"];
const MAX_DISK = argv["max-disk"];
const ROOM_NAME = argv["room-name"];
const getDockerContainerStats = async () => {
    return new Promise((resolve, reject) => {
        const metricTerminal = pty.spawn("docker", ["stats", "--no-stream", "--format", `"{{ json . }}"`], {});
        const stats = {};
        metricTerminal.onData((data) => {
            data.toString().split("\n").forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    const stat = JSON.parse(trimmedLine.slice(1, -1));
                    if (stat.Name.includes(`${CONTAINER_PREFIX}_${ROOM_NAME}`)) {
                        stats[stat.Name] = stat;
                    }
                }
            });
        });
        metricTerminal.onExit((ev) => {
            resolve(stats);
        });
    });
};
const sendMetrics = async () => {
    const containers = await getDockerContainerStats();
    const url = `http://${CENTRAL_SERVER}/metrics`;
    const body = {
        "roomName": ROOM_NAME,
        "availableCpu": String(MAX_CPU),
        "availableMemory": String(MAX_MEMORY),
        "availableDisk": MAX_DISK,
        "containers": containers
    };
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => {
        if (res.status != 200) {
            throw new Error(JSON.stringify(res));
        }
    })
        .catch((err) => {
        console.log(err);
    });
};
sendMetrics();
