import { Command } from 'commander';

import { listRemoteSkills } from '../lib/api.js';
import { detectAgent } from '../lib/detect-agent.js';
import { listInstalledSkills } from '../lib/storage.js';

export const listCommand = new Command('list')
  .description('List installed or available skills')
  .option('-r, --remote', 'List all available skills from xpay.tools')
  .action(async (options: { remote?: boolean }) => {
    try {
      if (options.remote) {
        console.log('Fetching available skills from xpay.tools...\n');
        const content = await listRemoteSkills();
        console.log(content);
        return;
      }

      const agent = detectAgent();
      const skills = listInstalledSkills(agent);

      if (skills.length === 0) {
        console.log(`No skills installed for ${agent.name}.`);
        console.log(`\nInstall one with: xpay install <provider>/<tool>`);
        return;
      }

      console.log(`Installed skills for ${agent.name}:\n`);
      for (const skill of skills) {
        console.log(`  ${skill}`);
      }
      console.log(`\n${skills.length} skill(s) installed.`);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });
