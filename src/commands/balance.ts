import { Command } from 'commander';
import chalk from 'chalk';
import { getBalance } from '../lib/api.js';
import { requireApiKey } from '../lib/auth.js';
import { spinner, printBox, printError } from '../lib/ui.js';

export const balanceCommand = new Command('balance')
  .description('Check your wallet balance')
  .action(async () => {
    try {
      requireApiKey();

      const s = spinner('Fetching balance...');
      s.start();

      const balance = await getBalance();
      s.stop();

      printBox('Wallet Balance', [
        `${chalk.bold('Available')}: ${chalk.green(`$${balance.available.toFixed(2)}`)}`,
        `${chalk.dim('Credits')}:   $${balance.credits.toFixed(2)}`,
        `${chalk.dim('Deposited')}: $${balance.balance.toFixed(2)}`,
      ]);

      if (balance.available < 0.5) {
        console.log(chalk.yellow(`\n  Low balance! Top up at: https://xpay.tools/account`));
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      printError(msg);
      process.exit(1);
    }
  });
