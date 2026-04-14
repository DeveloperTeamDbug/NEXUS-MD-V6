const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BOT_URL = 'https://nexus-full-db.vercel.app/index.js';
const BOT_FILE = path.join(__dirname, 'nexus.js');  
const UPDATE_FLAG_FILE = path.join(__dirname, '.update-flag');
const FORCE_UPDATE_FLAG_FILE = path.join(__dirname, '.force-update-flag');

async function downloadBot() {
    console.log('📥 Downloading nexus.js from Vercel...');
    const response = await axios.get(BOT_URL, { responseType: 'text' });
    fs.writeFileSync(BOT_FILE, response.data);
    console.log('✅ nexus.js downloaded successfully!');
    return true;
}

async function performUpdate() {
    console.log('🚀 Performing update...');
    if (fs.existsSync(BOT_FILE)) {
        const backupFile = path.join(__dirname, 'nexus.js.backup');
        fs.copyFileSync(BOT_FILE, backupFile);
        console.log('✅ Backup created: nexus.js.backup');
    }
    await downloadBot();
    return true;
}

async function performForceUpdate() {
    console.log('⚠️ Performing FORCE update...');
    const dirsToDelete = ['lib', 'plugins'];
    for (const dir of dirsToDelete) {
        const dirPath = path.join(__dirname, dir);
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`🗑️ Deleted: ${dir}`);
        }
    }
    await downloadBot();
    return true;
}

async function checkForSignals() {
    if (fs.existsSync(FORCE_UPDATE_FLAG_FILE)) {
        fs.unlinkSync(FORCE_UPDATE_FLAG_FILE);
        await performForceUpdate();
        return true;
    }
    if (fs.existsSync(UPDATE_FLAG_FILE)) {
        fs.unlinkSync(UPDATE_FLAG_FILE);
        await performUpdate();
        return true;
    }
    return false;
}

async function startBot() {
    if (!fs.existsSync(BOT_FILE)) {
        await downloadBot();
    }
    
    // ⭐ nexus.js require කරන්න
    delete require.cache[require.resolve(BOT_FILE)];
    require(BOT_FILE);
}

async function main() {
    console.log('🚀 NEXUS-MD Loader');
    await checkForSignals();
    await startBot();
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
});

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
