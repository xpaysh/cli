import { Command } from 'commander';
import chalk from 'chalk';
import { listServers } from '../lib/api.js';
import { detectAgent } from '../lib/detect-agent.js';
import { listInstalledSkills, getSkillInstallDate } from '../lib/storage.js';
import { spinner, printTable, formatPrice, formatNumber, printInfo } from '../lib/ui.js';

export const listCommand = new Command('list')
  .description('List installed or available tools')
  .option('-r, --remote', 'List all available tools from xpay.tools')
  .action(async (options: { remote?: boolean }) => {
    try {
      if (options.remote) {
        const s = spinner('Fetching available tools...');
        s.start();

        const { servers, totalServers, totalTools } = await listServers();
        s.stop();

        console.log(chalk.bold(`\n  ${totalServers} providers, ${totalTools} tools available\n`));

        const rows = servers
          .sort((a, b) => (b.totalCalls || 0) - (a.totalCalls || 0))
          .map((server) => {
            const avgPrice = server.tools?.length
              ? server.tools.reduce((sum, t) => sum + (t.price || 0), 0) / server.tools.length
              : 0;
            return [
              chalk.bold(server.slug),
              server.name,
              (server.toolCount || 0).toString(),
              formatPrice(avgPrice),
              formatNumber(server.totalCalls || 0),
            ];
          });

        printTable(['Slug', 'Name', 'Tools', 'Avg Price', 'Calls'], rows);

        console.log(chalk.dim(`\n  Install: xpay install <slug>`));
        console.log(chalk.dim(`  Search:  xpay search <query>`));
        return;
      }

      // Local installed skills
      const agent = detectAgent();
      const skills = listInstalledSkills(agent);

      if (skills.length === 0) {
        printInfo(`No skills installed for ${agent.name}.`);
        console.log(chalk.dim(`\n  Install one: xpay install <provider>`));
        console.log(chalk.dim(`  Browse:      xpay list --remote`));
        return;
      }

      console.log(chalk.bold(`\n  Installed skills for ${agent.name}\n`));

      const rows = skills.map((skill) => {
        const date = getSkillInstallDate(agent, skill);
        const type = skill.startsWith('xpay-collection-') ? 'collection' : 'skill';
        return [
          chalk.bold(skill),
          type,
          date ? date.toLocaleDateString() : chalk.dim('unknown'),
        ];
      });

      printTable(['Skill', 'Type', 'Installed'], rows);

      console.log(chalk.dim(`\n  ${skills.length} skill(s) installed.`));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });
