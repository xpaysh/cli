#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const search_js_1 = require("./commands/search.js");
const install_js_1 = require("./commands/install.js");
const list_js_1 = require("./commands/list.js");
const config_js_1 = require("./commands/config.js");
const program = new commander_1.Command();
program
    .name('xpay')
    .description('Discover and install xpay skills for AI agents')
    .version('0.1.0');
program.addCommand(search_js_1.searchCommand);
program.addCommand(install_js_1.installCommand);
program.addCommand(list_js_1.listCommand);
program.addCommand(config_js_1.configCommand);
program.parse();
