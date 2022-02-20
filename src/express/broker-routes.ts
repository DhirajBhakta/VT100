import { Metric, MetricRequest } from "@types";
import express from "express";
import logger from "../utils/log.js";
import { metricStore } from "../config.js";
const router = express.Router();


router.use(express.json());

const CONTAINER_HEALTH_TIMEOUT = 30
const isAvailable = (metric: Metric) => {
    const timeDiff = Math.round((new Date().getTime() - new Date(metric.lastUpdated).getTime()) / 1000);
    // Available only if donor sent metrics in the last 30s and isn't connected to a peer
    return timeDiff <= CONTAINER_HEALTH_TIMEOUT && Object.keys(metric.containers || {}).length == 0
}

// List available
router.get("/available", (req, res) => {
    try {
        let metrics = metricStore.list();
        let avaiableDonors = metrics.filter(isAvailable)
        const response = {
            metrics: avaiableDonors,
        };
        return res.json(response);
    } catch (err: any) {
        logger.error(err)
        return res.status(500).json({ error: err.message });
    }
});

// List metrics
router.get("/", (req, res) => {
    try {
        let metrics = metricStore.list();
        const response = {
            metrics: metrics,
        };
        return res.json(response);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

// Update metrics
router.post("/", (req, res) => {
    try {
        const metric: MetricRequest = req.body;
        metricStore.set(metric);
        return res.sendStatus(200);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

// Get metric from roomName
router.get("/:roomName", (req, res) => {
    try {
        const roomName: string = req.params.roomName;
        const metric: Metric = metricStore.get(roomName);
        if (!metric) {
            return res.sendStatus(404);
        } else {
            return res.json(metric);
        }
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
