import { Command } from 'commander';

import { readConfig, writeConfig } from '../lib/storage.js';

export const configCommand = new Command('config')
  .description('Manage xpay CLI configuration');

configCommand
  .command('set')
  .description('Set a config value')
  .argument('<key>', 'Config key (e.g. api-key)')
  .argument('<value>', 'Config value')
  .action((key: string, value: string) => {
    writeConfig(key, value);
    console.log(`Set ${key} = ${key === 'api-key' ? '****' : value}`);
  });

configCommand
  .command('get')
  .description('Get a config value')
  .argument('<key>', 'Config key')
  .action((key: string) => {
    const config = readConfig();
    if (key in config) {
      console.log(key === 'api-key' ? '****' : config[key]);
    } else {
      console.log(`Key "${key}" not set.`);
    }
  });
