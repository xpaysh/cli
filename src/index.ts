#!/usr/bin/env node

import { Command } from 'commander';
import { VERSION } from './lib/constants.js';

import { searchCommand } from './commands/search.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { configCommand } from './commands/config.js';
import { loginCommand } from './commands/login.js';
import { balanceCommand } from './commands/balance.js';
import { doctorCommand } from './commands/doctor.js';
import { initCommand } from './commands/init.js';
import { budgetCommand } from './commands/budget.js';
import { runCommand } from './commands/run.js';
import { tryCommand } from './commands/try.js';

const program = new Command();

program
  .name('xpay')
  .description('Discover, install, and manage AI tools from xpay.tools')
  .version(VERSION);

// Auth
program.addCommand(loginCommand);
program.addCommand(balanceCommand);

// Discovery
program.addCommand(searchCommand);
program.addCommand(listCommand);

// Install & manage
program.addCommand(installCommand);
program.addCommand(initCommand);

// Execution
program.addCommand(runCommand);
program.addCommand(tryCommand);

// Budget & config
program.addCommand(budgetCommand);
program.addCommand(configCommand);
program.addCommand(doctorCommand);

program.parse();
