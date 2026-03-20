

// ============== CONFIG SETTINGS ==============

const CONFIG = {
    baseURL: "http://wp/",
    viewport: { width: 1920, height: 1080 },
    defaultTimeout: 10000,
    navigationTimeout: 30000,
    throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
    },
    lighthouse: {
        name: "local-test",
        throttlingMethod: "simulate",
        screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            disabled: false
        },
        formFactor: "desktop",
        onlyCategories: ['performance'],
        disableJavaScript: false
    }
};

module.exports = { CONFIG };
