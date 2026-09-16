import { Command } from 'commander';
import chalk from 'chalk';
import { isAuthenticated, getApiKey } from '../lib/auth.js';
import { getBalance, listServers } from '../lib/api.js';
import { isMcpConfigured } from '../lib/mcp-config.js';
import { detectAgent } from '../lib/detect-agent.js';
import { listInstalledSkills } from '../lib/storage.js';
import { printCheck, divider } from '../lib/ui.js';

export const doctorCommand = new Command('doctor')
  .description('Check your xpay setup')
  .action(async () => {
    console.log(chalk.bold('\n  xpay doctor\n'));

    let allGood = true;

    // 1. API key
    const hasKey = isAuthenticated();
    printCheck(hasKey, hasKey ? 'API key configured' : 'API key not set (run `xpay login`)');
    if (!hasKey) allGood = false;

    // 2. Validate key / balance
    if (hasKey) {
      try {
        const balance = await getBalance();
        const hasBalance = balance.available > 0.5;
        printCheck(
          hasBalance,
          hasBalance
            ? `Balance: $${balance.available.toFixed(2)}`
            : `Low balance: $${balance.available.toFixed(2)} (top up at xpay.tools/account)`
        );
        if (!hasBalance) allGood = false;
      } catch {
        printCheck(false, 'API key invalid or API unreachable');
        allGood = false;
      }
    }

    // 3. MCP configured
    const mcpOk = isMcpConfigured();
    printCheck(mcpOk, mcpOk ? 'MCP server configured' : 'MCP not configured (run `xpay login`)');
    if (!mcpOk) allGood = false;

    // 4. Skills installed
    const agent = detectAgent();
    const skills = listInstalledSkills(agent);
    const hasSkills = skills.length > 0;
    printCheck(
      hasSkills,
      hasSkills
        ? `${skills.length} skill(s) installed for ${agent.name}`
        : `No skills installed (run \`xpay install <slug>\`)`
    );
    if (!hasSkills) allGood = false;

    // 5. API reachable
    try {
      await listServers();
      printCheck(true, 'API reachable');
    } catch {
      printCheck(false, 'API unreachable');
      allGood = false;
    }

    divider();

    if (allGood) {
      console.log(chalk.green('\n  All checks passed! You\'re ready to go.\n'));
    } else {
      console.log(chalk.yellow('\n  Some checks failed. Fix the issues above.\n'));
    }
  });
