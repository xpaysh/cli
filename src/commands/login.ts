import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline';
import { ACCOUNT_URL } from '../lib/constants.js';
import { setApiKey, maskKey } from '../lib/auth.js';
import { getBalance } from '../lib/api.js';
import { configureMcp } from '../lib/mcp-config.js';
import { spinner, printSuccess, printBox, printError } from '../lib/ui.js';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export const loginCommand = new Command('login')
  .description('Authenticate with your xpay API key')
  .option('--key <apiKey>', 'API key (or paste interactively)')
  .action(async (options: { key?: string }) => {
    try {
      let key = options.key;

      if (!key) {
        console.log(chalk.bold('\n  xpay login\n'));
        console.log(`  1. Get your API key at: ${chalk.cyan(ACCOUNT_URL)}`);
        console.log(`  2. Paste it below\n`);

        // Try to open browser
        try {
          const open = (await import('open')).default;
          await open(ACCOUNT_URL);
          console.log(chalk.dim('  (Opened in browser)\n'));
        } catch {
          // browser open is best-effort
        }

        key = await prompt('  API key: ');
      }

      if (!key) {
        printError('No API key provided.');
        return;
      }

      // Validate by calling balance
      const s = spinner('Validating API key...');
      s.start();

      setApiKey(key);

      try {
        const balance = await getBalance();
        s.stop();

        printSuccess(`Authenticated! Key: ${maskKey(key)}`);
        console.log('');

        printBox('Wallet Balance', [
          `${chalk.bold('Available')}: ${chalk.green(`$${balance.available.toFixed(2)}`)}`,
          `${chalk.dim('Credits')}:   $${balance.credits.toFixed(2)}`,
          `${chalk.dim('Deposited')}: $${balance.balance.toFixed(2)}`,
        ]);

        // Auto-configure MCP
        console.log('');
        const mcpResult = configureMcp();
        if (mcpResult.configured) {
          printSuccess(mcpResult.message);
        } else {
          console.log(chalk.dim(`  ${mcpResult.message}`));
        }

        console.log(chalk.dim(`\n  Next: xpay search "web scraping"`));
      } catch (err) {
        s.stop();
        setApiKey(''); // clear invalid key
        const msg = err instanceof Error ? err.message : String(err);
        printError(`Invalid API key: ${msg}`);
        console.log(chalk.dim(`\n  Get your key at: ${ACCOUNT_URL}`));
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });
