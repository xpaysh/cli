"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCommand = void 0;
const commander_1 = require("commander");
const api_js_1 = require("../lib/api.js");
const detect_agent_js_1 = require("../lib/detect-agent.js");
const storage_js_1 = require("../lib/storage.js");
exports.installCommand = new commander_1.Command('install')
    .description('Install a skill for your AI agent')
    .argument('<slug>', 'Provider/tool slug (e.g. firecrawl/scrape)')
    .option('-c, --collection', 'Install a collection skill')
    .option('--agent <type>', 'Force agent type (claude, openclaw, cursor)')
    .action(async (slug, options) => {
    try {
        const agent = (0, detect_agent_js_1.detectAgent)();
        if (options.agent) {
            agent.type = options.agent;
            agent.name = options.agent;
        }
        const path = options.collection ? `c/${slug}` : slug;
        const skillName = options.collection
            ? `xpay-collection-${slug}`
            : `xpay-${slug.replace('/', '-')}`;
        console.log(`Fetching skill: ${path}...`);
        const content = await (0, api_js_1.fetchSkillMd)(path);
        console.log(`Installing to ${agent.name} skills directory...`);
        const filePath = (0, storage_js_1.writeSkill)(agent, skillName, content);
        console.log(`\nInstalled: ${filePath}`);
        console.log(`\nSkill "${skillName}" is now available to ${agent.name}.`);
        if (agent.type === 'claude') {
            console.log(`\nTip: Make sure MCP is configured:`);
            console.log(`  claude mcp add --transport http xpay "https://mcp.xpay.sh/mcp?key=YOUR_API_KEY"`);
        }
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
