import { Command } from 'commander';

import { fetchSkillMd } from '../lib/api.js';
import { detectAgent } from '../lib/detect-agent.js';
import { writeSkill } from '../lib/storage.js';

export const installCommand = new Command('install')
  .description('Install a skill for your AI agent')
  .argument('<slug>', 'Provider/tool slug (e.g. firecrawl/scrape)')
  .option('-c, --collection', 'Install a collection skill')
  .option('--agent <type>', 'Force agent type (claude, openclaw, cursor)')
  .action(async (slug: string, options: { collection?: boolean; agent?: string }) => {
    try {
      const agent = detectAgent();

      if (options.agent) {
        agent.type = options.agent as any;
        agent.name = options.agent;
      }

      const path = options.collection ? `c/${slug}` : slug;
      const skillName = options.collection
        ? `xpay-collection-${slug}`
        : `xpay-${slug.replace('/', '-')}`;

      console.log(`Fetching skill: ${path}...`);
      const content = await fetchSkillMd(path);

      console.log(`Installing to ${agent.name} skills directory...`);
      const filePath = writeSkill(agent, skillName, content);

      console.log(`\nInstalled: ${filePath}`);
      console.log(`\nSkill "${skillName}" is now available to ${agent.name}.`);

      if (agent.type === 'claude') {
        console.log(`\nTip: Make sure MCP is configured:`);
        console.log(
          `  claude mcp add --transport http xpay "https://mcp.xpay.sh/mcp?key=YOUR_API_KEY"`
        );
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });
