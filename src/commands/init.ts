import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline';
import * as path from 'node:path';
import { createDefaultManifest, writeManifest, findManifest } from '../lib/manifest.js';
import { printSuccess, printWarning, printInfo } from '../lib/ui.js';

function prompt(question: string, defaultVal?: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const suffix = defaultVal ? ` (${defaultVal})` : '';
  return new Promise((resolve) => {
    rl.question(`  ${question}${suffix}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultVal || '');
    });
  });
}

export const initCommand = new Command('init')
  .description('Initialize xpay.json in current directory')
  .option('-y, --yes', 'Use defaults without prompting')
  .action(async (options: { yes?: boolean }) => {
    try {
      // Check if manifest already exists
      const existing = findManifest();
      if (existing) {
        printWarning(`xpay.json already exists at ${existing}`);
        return;
      }

      const dirName = path.basename(process.cwd());

      let name: string;
      let description: string;
      let dailyBudget: number;
      let monthlyBudget: number;

      if (options.yes) {
        name = dirName;
        description = '';
        dailyBudget = 5;
        monthlyBudget = 50;
      } else {
        console.log(chalk.bold('\n  Initialize xpay.json\n'));

        name = await prompt('Project name', dirName);
        description = await prompt('Description');
        const daily = await prompt('Daily budget ($)', '5');
        const monthly = await prompt('Monthly budget ($)', '50');
        dailyBudget = parseFloat(daily) || 5;
        monthlyBudget = parseFloat(monthly) || 50;
      }

      const manifest = createDefaultManifest(name, description);
      manifest.budget = { daily: dailyBudget, monthly: monthlyBudget };

      const filePath = writeManifest(manifest);
      console.log('');
      printSuccess(`Created ${filePath}`);

      printInfo('Add tools with: xpay install <slug>');
      printInfo('Install all from manifest: xpay install');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });
