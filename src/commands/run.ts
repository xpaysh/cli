import { Command } from 'commander';
import chalk from 'chalk';
import { mcpCall } from '../lib/api.js';
import { requireApiKey } from '../lib/auth.js';
import { spinner, printError, printSuccess } from '../lib/ui.js';

export const runCommand = new Command('run')
  .description('Execute a tool directly')
  .argument('<tool>', 'Tool in provider/tool format (e.g. exa/web_search_exa)')
  .option('--json <params>', 'JSON parameters for the tool')
  .allowUnknownOption(true)
  .action(async (tool: string, options: { json?: string }, command: Command) => {
    try {
      requireApiKey();

      const parts = tool.split('/');
      if (parts.length !== 2) {
        printError('Tool must be in provider/tool format (e.g. exa/web_search_exa)');
        process.exit(1);
      }

      const [serverSlug, toolName] = parts;

      // Parse params from --json or from remaining args as --key value pairs
      let params: Record<string, unknown> = {};
      if (options.json) {
        try {
          params = JSON.parse(options.json);
        } catch {
          printError('Invalid JSON parameters');
          process.exit(1);
        }
      } else {
        // Parse --key value pairs from remaining args
        const args = command.args.slice(1); // skip the tool argument
        for (let i = 0; i < args.length; i++) {
          if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
            params[key] = value;
            if (value !== 'true') i++;
          }
        }
      }

      const s = spinner(`Running ${tool}...`);
      s.start();

      // First initialize
      await mcpCall('initialize', {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'xpay-cli', version: '0.2.0' },
      }, serverSlug);

      // Then call the tool
      const response = await mcpCall(
        'tools/call',
        { name: toolName, arguments: params },
        serverSlug
      );

      s.stop();

      if (response.error) {
        printError(`${response.error.message}`);
        process.exit(1);
      }

      // Extract result
      const result = response.result as { content?: Array<{ type: string; text: string }> };
      if (result?.content) {
        for (const item of result.content) {
          if (item.type === 'text') {
            // Check if the last line is a cost line
            const lines = item.text.split('\n');
            const lastLine = lines[lines.length - 1];
            if (lastLine.includes('Cost:') && lastLine.includes('xpay')) {
              // Print result without cost line
              console.log(lines.slice(0, -1).join('\n'));
              console.log(chalk.dim(lastLine));
            } else {
              console.log(item.text);
            }
          }
        }
      } else {
        console.log(JSON.stringify(response.result, null, 2));
      }

      printSuccess('Done');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      printError(msg);
      process.exit(1);
    }
  });
