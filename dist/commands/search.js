"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCommand = void 0;
const commander_1 = require("commander");
const api_js_1 = require("../lib/api.js");
exports.searchCommand = new commander_1.Command('search')
    .description('Search for skills by keyword')
    .argument('<query>', 'Search query')
    .action(async (query) => {
    try {
        console.log(`Searching for "${query}"...\n`);
        const results = await (0, api_js_1.searchSkills)(query);
        console.log(results);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
