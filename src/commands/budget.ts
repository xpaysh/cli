import { Command } from 'commander';
import chalk from 'chalk';
import { readConfig, writeConfigValue } from '../lib/storage.js';
import { getBalance } from '../lib/api.js';
import { isAuthenticated } from '../lib/auth.js';
import { printBox, printSuccess, printError, progressBar } from '../lib/ui.js';

export const budgetCommand = new Command('budget').description('Manage spending limits');

budgetCommand
  .command('set')
  .description('Set spending limits')
  .option('--daily <amount>', 'Daily spending limit ($)')
  .option('--monthly <amount>', 'Monthly spending limit ($)')
  .action((options: { daily?: string; monthly?: string }) => {
    if (options.daily) {
      writeConfigValue('budget-daily', options.daily);
      printSuccess(`Daily limit: $${options.daily}`);
    }
    if (options.monthly) {
      writeConfigValue('budget-monthly', options.monthly);
      printSuccess(`Monthly limit: $${options.monthly}`);
    }
    if (!options.daily && !options.monthly) {
      console.log(chalk.yellow('Usage: xpay budget set --daily <$> --monthly <$>'));
    }
  });

budgetCommand
  .command('show')
  .description('Show budget status')
  .action(async () => {
    try {
      const config = readConfig();
      const daily = parseFloat(config['budget-daily'] || '0');
      const monthly = parseFloat(config['budget-monthly'] || '0');

      if (!daily && !monthly) {
        console.log(chalk.dim('  No budget limits set. Use: xpay budget set --daily 5 --monthly 50'));
        return;
      }

      const lines: string[] = [];

      if (daily > 0) {
        // Client-side estimate: we can't track exact daily spend without transaction history
        lines.push(`${chalk.bold('Daily limit')}:   $${daily.toFixed(2)}`);
        lines.push(`  ${progressBar(0, daily)}`);
      }

      if (monthly > 0) {
        lines.push(`${chalk.bold('Monthly limit')}: $${monthly.toFixed(2)}`);
        lines.push(`  ${progressBar(0, monthly)}`);
      }

      if (isAuthenticated()) {
        try {
          const balance = await getBalance();
          lines.push('');
          lines.push(`${chalk.bold('Balance')}: ${chalk.green(`$${balance.available.toFixed(2)}`)}`);
        } catch {
          // non-critical
        }
      }

      printBox('Budget', lines);
      console.log(chalk.dim('\n  Note: Spend tracking requires transaction history (coming soon).'));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      printError(msg);
    }
  });

// Default action: show budget
budgetCommand.action(async () => {
  await budgetCommand.commands.find((c) => c.name() === 'show')?.parseAsync([], { from: 'user' });
});
