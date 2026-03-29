const fs = require('fs');
const path = require('path');

const logDebug = (msg) => {
    try {
        const logPath = path.join(__dirname, '../debug_setup.txt');
        fs.appendFileSync(logPath, new Date().toISOString() + " " + msg + "\n");
    } catch (e) {
        // ignore
    }
};

module.exports = logDebug;
