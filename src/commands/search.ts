import { Command } from 'commander';

import { searchSkills } from '../lib/api.js';

export const searchCommand = new Command('search')
  .description('Search for skills by keyword')
  .argument('<query>', 'Search query')
  .action(async (query: string) => {
    try {
      console.log(`Searching for "${query}"...\n`);
      const results = await searchSkills(query);
      console.log(results);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });
