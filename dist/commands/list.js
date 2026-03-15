"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommand = void 0;
const commander_1 = require("commander");
const api_js_1 = require("../lib/api.js");
const detect_agent_js_1 = require("../lib/detect-agent.js");
const storage_js_1 = require("../lib/storage.js");
exports.listCommand = new commander_1.Command('list')
    .description('List installed or available skills')
    .option('-r, --remote', 'List all available skills from xpay.tools')
    .action(async (options) => {
    try {
        if (options.remote) {
            console.log('Fetching available skills from xpay.tools...\n');
            const content = await (0, api_js_1.listRemoteSkills)();
            console.log(content);
            return;
        }
        const agent = (0, detect_agent_js_1.detectAgent)();
        const skills = (0, storage_js_1.listInstalledSkills)(agent);
        if (skills.length === 0) {
            console.log(`No skills installed for ${agent.name}.`);
            console.log(`\nInstall one with: xpay install <provider>/<tool>`);
            return;
        }
        console.log(`Installed skills for ${agent.name}:\n`);
        for (const skill of skills) {
            console.log(`  ${skill}`);
        }
        console.log(`\n${skills.length} skill(s) installed.`);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
