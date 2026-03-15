#!/usr/bin/env node

import { Command } from 'commander';

import { searchCommand } from './commands/search.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('xpay')
  .description('Discover and install xpay skills for AI agents')
  .version('0.1.0');

program.addCommand(searchCommand);
program.addCommand(installCommand);
program.addCommand(listCommand);
program.addCommand(configCommand);

program.parse();
