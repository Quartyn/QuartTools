import { resolve } from 'path';
import fs from 'fs';

const defaultBrowser = 'firefox';
const browsers = [ "firefox", "chrome" ];

export interface manifestBuilderOptions {
    browser: 'firefox' | 'chrome';
}

export default function manifestBuilder(options: manifestBuilderOptions) {
    return {
        name: "manifest-builder",
        closeBundle() {
            buildManifest(options.browser || defaultBrowser);
        }
    }
}

function buildManifest(browser: 'firefox' | 'chrome') {
    const manifestPath = resolve(__dirname, '../manifest.json');
    const manifestBuild = resolve(__dirname, '../dist/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const browserSpecific = Object.keys(manifest).filter(key => key.startsWith(`__${browser}__`));
    browserSpecific.forEach(key => {
        const originalKey = key.replace(`__${browser}__`, '');

        manifest[originalKey] = manifest[key]; // Update value with browser specific setting.
        delete manifest[key]; 
    });

    // Check for additional (non-build browser) settings, and remove them.
    const differentBrowserKeys = Object.keys(manifest).filter(key => {
        return browsers.some(name => key.startsWith(`__${name}__`));
    });
    differentBrowserKeys.forEach(key => delete manifest[key]);

    fs.writeFileSync(manifestBuild, JSON.stringify(manifest, null, 4));
}