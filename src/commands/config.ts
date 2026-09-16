import { Command } from 'commander';
import chalk from 'chalk';
import { readConfig, writeConfigValue, clearCache, getConfigPath } from '../lib/storage.js';
import { maskKey } from '../lib/auth.js';
import { printSuccess, printInfo } from '../lib/ui.js';

export const configCommand = new Command('config').description('Manage CLI configuration');

configCommand
  .command('set')
  .description('Set a config value')
  .argument('<key>', 'Config key (e.g. api-key)')
  .argument('<value>', 'Config value')
  .action((key: string, value: string) => {
    writeConfigValue(key, value);
    const display = key === 'api-key' ? maskKey(value) : value;
    printSuccess(`${key} = ${display}`);
  });

configCommand
  .command('get')
  .description('Get a config value')
  .argument('<key>', 'Config key')
  .action((key: string) => {
    const config = readConfig();
    if (key in config) {
      const display = key === 'api-key' ? maskKey(config[key]) : config[key];
      console.log(display);
    } else {
      printInfo(`Key "${key}" not set.`);
    }
  });

configCommand
  .command('path')
  .description('Show config file path')
  .action(() => {
    console.log(getConfigPath());
  });

configCommand
  .command('clear-cache')
  .description('Clear API response cache')
  .action(() => {
    clearCache();
    printSuccess('Cache cleared.');
  });

configCommand
  .command('show')
  .description('Show all config values')
  .action(() => {
    const config = readConfig();
    const keys = Object.keys(config);
    if (keys.length === 0) {
      printInfo('No config values set.');
      return;
    }
    for (const key of keys) {
      const display = key === 'api-key' ? maskKey(config[key]) : config[key];
      console.log(`  ${chalk.bold(key)}: ${display}`);
    }
  });
