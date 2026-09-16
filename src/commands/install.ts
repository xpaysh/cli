import { Command } from 'commander';
import chalk from 'chalk';
import { fetchSkillMd, listServers } from '../lib/api.js';
import { detectAgent, getAgentByType } from '../lib/detect-agent.js';
import { writeSkill } from '../lib/storage.js';
import { configureMcp } from '../lib/mcp-config.js';
import { addToolToManifest, addCollectionToManifest, readManifest } from '../lib/manifest.js';
import { isAuthenticated } from '../lib/auth.js';
import { spinner, printSuccess, printInfo, printTable, formatPrice, printWarning } from '../lib/ui.js';

export const installCommand = new Command('install')
  .description('Install a skill for your AI agent')
  .argument('[slug]', 'Provider or provider/tool slug (e.g. firecrawl, firecrawl/scrape)')
  .option('-c, --collection', 'Install a collection skill')
  .option('--agent <type>', 'Force agent type (claude, openclaw, cursor)')
  .action(async (slug: string | undefined, options: { collection?: boolean; agent?: string }) => {
    try {
      // If no slug, install from xpay.json manifest
      if (!slug) {
        const manifest = readManifest();
        if (!manifest) {
          console.log(chalk.yellow('Usage: xpay install <slug>'));
          console.log(chalk.dim('\n  Or create xpay.json with: xpay init'));
          return;
        }

        const tools = Object.keys(manifest.tools || {});
        const collections = Object.keys(manifest.collections || {});

        if (tools.length === 0 && collections.length === 0) {
          printInfo('No tools defined in xpay.json.');
          return;
        }

        console.log(chalk.bold(`Installing from xpay.json: ${manifest.name}\n`));
        const agent = options.agent ? getAgentByType(options.agent) : detectAgent();

        for (const tool of tools) {
          const s = spinner(`Installing ${tool}...`);
          s.start();
          try {
            const content = await fetchSkillMd(tool);
            const skillName = `xpay-${tool.replace('/', '-')}`;
            writeSkill(agent, skillName, content);
            s.succeed(`Installed ${tool}`);
          } catch {
            s.fail(`Failed to install ${tool}`);
          }
        }

        for (const col of collections) {
          const s = spinner(`Installing collection ${col}...`);
          s.start();
          try {
            const content = await fetchSkillMd(`c/${col}`);
            writeSkill(agent, `xpay-collection-${col}`, content);
            s.succeed(`Installed collection ${col}`);
          } catch {
            s.fail(`Failed to install collection ${col}`);
          }
        }

        return;
      }

      const agent = options.agent ? getAgentByType(options.agent) : detectAgent();

      const apiPath = options.collection ? `c/${slug}` : slug;
      const skillName = options.collection
        ? `xpay-collection-${slug}`
        : `xpay-${slug.replace('/', '-')}`;

      const s = spinner(`Fetching skill: ${apiPath}...`);
      s.start();

      const content = await fetchSkillMd(apiPath);
      writeSkill(agent, skillName, content);
      s.succeed(`Installed to ${agent.name}`);

      // Add to manifest if present
      if (options.collection) {
        addCollectionToManifest(slug);
      } else {
        addToolToManifest(slug);
      }

      // Show pricing info
      try {
        const { servers } = await listServers();
        const providerSlug = slug.split('/')[0];
        const server = servers.find((s) => s.slug === providerSlug);
        if (server?.tools?.length) {
          console.log('');
          const rows = server.tools.map((t) => [t.name, formatPrice(t.price)]);
          printTable(['Tool', 'Price/call'], rows, { compact: true });
        }
      } catch {
        // non-critical
      }

      // Auto-configure MCP if authenticated
      if (isAuthenticated()) {
        const result = configureMcp();
        if (result.configured) {
          printSuccess(result.message);
        }
      } else {
        console.log('');
        printWarning('MCP not configured. Run `xpay login` to set up.');
      }

      console.log(chalk.dim(`\n  Skill path: ${agent.skillsDir}/${skillName}/SKILL.md`));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${msg}`));
      process.exit(1);
    }
  });
