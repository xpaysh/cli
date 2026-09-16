import { Command } from 'commander';
import chalk from 'chalk';
import { listServers, fuzzyMatch } from '../lib/api.js';
import { spinner, printTable, formatPrice, formatNumber, printWarning } from '../lib/ui.js';

export const searchCommand = new Command('search')
  .description('Search for tools and providers')
  .argument('<query>', 'Search query (e.g. "web scraping", "firecrawl")')
  .action(async (query: string) => {
    const s = spinner(`Searching for "${query}"...`);
    s.start();

    try {
      const { servers } = await listServers();

      // Match against server names, descriptions, and tool names
      const matches = servers.filter((server) => {
        if (fuzzyMatch(server.name, query)) return true;
        if (fuzzyMatch(server.description || '', query)) return true;
        if (server.tools?.some((t) => fuzzyMatch(t.name, query) || fuzzyMatch(t.description || '', query))) return true;
        return false;
      });

      s.stop();

      if (matches.length === 0) {
        printWarning(`No results for "${query}". Try broader terms.`);
        console.log(chalk.dim(`\n  Browse all: xpay list --remote`));
        return;
      }

      console.log(chalk.bold(`\n  ${matches.length} provider(s) found\n`));

      const rows = matches.map((server) => {
        const avgPrice = server.tools?.length
          ? server.tools.reduce((sum, t) => sum + (t.price || 0), 0) / server.tools.length
          : 0;
        return [
          chalk.bold(server.slug),
          server.toolCount?.toString() || '0',
          formatPrice(avgPrice),
          formatNumber(server.totalCalls || 0),
        ];
      });

      printTable(['Provider', 'Tools', 'Avg Price', 'Total Calls'], rows);

      console.log(chalk.dim(`\n  Install: xpay install <provider>`));
    } catch (error: unknown) {
      s.stop();
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });
