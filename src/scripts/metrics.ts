import fetch from "isomorphic-fetch"
import pty from "node-pty";
import minimist from "minimist"
import { CENTRAL_SERVER, CONTAINER_PREFIX } from "../config.js";
import { ContainerMetric } from "@types";

/**
 * 
 * This "MetricDaemon" or "DaemonMetric" runs only on the Donor side
 */
const argv = minimist(process.argv.slice(2));

const MAX_CPU = argv["max-cpu"]
const MAX_MEMORY = argv["max-memory"]
const MAX_DISK = argv["max-disk"]
const ROOM_NAME = argv["room-name"]

interface Stats {
    [key: string]: ContainerMetric
}

const getDockerContainerStats = async () => {
    return new Promise<Stats>((resolve, reject) => {
        const metricTerminal = pty.spawn("docker", ["stats", "--no-stream", "--format", `"{{ json . }}"`], {})
        const stats: Stats = {}
        metricTerminal.onData((data) => {
            data.toString().split("\n").forEach(line => {
                const trimmedLine = line.trim()
                if(trimmedLine) {
                    const stat = JSON.parse(trimmedLine.slice(1, -1))
                    if(stat.Name.includes(`${CONTAINER_PREFIX}_${ROOM_NAME}`)) {
                        stats[stat.Name] = stat;
                    }
                }
            })
        })
        metricTerminal.onExit((ev) => {
            resolve(stats)
        })
    });
}


const sendMetrics = async () => {
    const containers = await getDockerContainerStats();

    const url = `http://${CENTRAL_SERVER}/metrics`
    const body = {
        "roomName": ROOM_NAME,
        "availableCpu": String(MAX_CPU),
        "availableMemory": String(MAX_MEMORY),
        "availableDisk": MAX_DISK,
        "containers": containers
    }
    
    
    fetch(url, { 
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body) 
    })
        .then(res => {
            if(res.status != 200) {
                throw new Error(JSON.stringify(res))
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

sendMetrics()
