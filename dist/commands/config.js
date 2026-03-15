"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const storage_js_1 = require("../lib/storage.js");
exports.configCommand = new commander_1.Command('config')
    .description('Manage xpay CLI configuration');
exports.configCommand
    .command('set')
    .description('Set a config value')
    .argument('<key>', 'Config key (e.g. api-key)')
    .argument('<value>', 'Config value')
    .action((key, value) => {
    (0, storage_js_1.writeConfig)(key, value);
    console.log(`Set ${key} = ${key === 'api-key' ? '****' : value}`);
});
exports.configCommand
    .command('get')
    .description('Get a config value')
    .argument('<key>', 'Config key')
    .action((key) => {
    const config = (0, storage_js_1.readConfig)();
    if (key in config) {
        console.log(key === 'api-key' ? '****' : config[key]);
    }
    else {
        console.log(`Key "${key}" not set.`);
    }
});
