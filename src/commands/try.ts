import { Command } from 'commander';
import chalk from 'chalk';
import { mcpCall, listServers } from '../lib/api.js';
import { getApiKey } from '../lib/auth.js';
import { spinner, printError, printInfo, printBox, printTable, formatPrice } from '../lib/ui.js';

export const tryCommand = new Command('try')
  .description('Try a tool (requires API key)')
  .argument('<tool>', 'Tool in provider/tool format (e.g. exa/web_search_exa)')
  .option('--json <params>', 'JSON parameters')
  .allowUnknownOption(true)
  .action(async (tool: string, options: { json?: string }, command: Command) => {
    try {
      const key = getApiKey();
      if (!key) {
        console.log(chalk.bold('\n  Try any tool on xpay.tools\n'));
        console.log(`  First, set up your account:`);
        console.log(chalk.cyan(`    xpay login`));
        console.log(chalk.dim(`\n  New users get $5 free credits!\n`));
        return;
      }

      const parts = tool.split('/');
      if (parts.length !== 2) {
        // Show available tools for this provider
        const providerSlug = parts[0];
        const s = spinner(`Fetching tools for ${providerSlug}...`);
        s.start();

        const { servers } = await listServers();
        const server = servers.find((s) => s.slug === providerSlug);
        s.stop();

        if (!server) {
          printError(`Provider "${providerSlug}" not found.`);
          console.log(chalk.dim('  Search: xpay search <query>'));
          return;
        }

        console.log(chalk.bold(`\n  ${server.name} — ${server.toolCount} tools\n`));
        if (server.tools?.length) {
          const rows = server.tools.map((t) => [
            chalk.bold(t.name),
            (t.description || '').slice(0, 50),
            formatPrice(t.price),
          ]);
          printTable(['Tool', 'Description', 'Price'], rows, { compact: true });
        }
        console.log(chalk.dim(`\n  Try: xpay try ${providerSlug}/<tool_name> --json '{"param":"value"}'`));
        return;
      }

      const [serverSlug, toolName] = parts;

      // Parse params
      let params: Record<string, unknown> = {};
      if (options.json) {
        try {
          params = JSON.parse(options.json);
        } catch {
          printError('Invalid JSON parameters');
          process.exit(1);
        }
      } else {
        const args = command.args.slice(1);
        for (let i = 0; i < args.length; i++) {
          if (args[i].startsWith('--')) {
            const argKey = args[i].slice(2);
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
            params[argKey] = value;
            if (value !== 'true') i++;
          }
        }
      }

      const s = spinner(`Trying ${tool}...`);
      s.start();

      // Initialize MCP session
      await mcpCall('initialize', {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'xpay-cli', version: '0.2.0' },
      }, serverSlug);

      // Call tool
      const response = await mcpCall(
        'tools/call',
        { name: toolName, arguments: params },
        serverSlug
      );

      s.stop();

      if (response.error) {
        printError(response.error.message);
        return;
      }

      // Display result
      const result = response.result as { content?: Array<{ type: string; text: string }> };
      if (result?.content) {
        console.log('');
        for (const item of result.content) {
          if (item.type === 'text') {
            const lines = item.text.split('\n');
            const lastLine = lines[lines.length - 1];
            if (lastLine.includes('Cost:') && lastLine.includes('xpay')) {
              // Truncate output for try
              const contentLines = lines.slice(0, -1);
              const preview = contentLines.slice(0, 20).join('\n');
              if (contentLines.length > 20) {
                console.log(preview);
                console.log(chalk.dim(`  ... ${contentLines.length - 20} more lines`));
              } else {
                console.log(preview);
              }
              console.log('');
              console.log(chalk.dim(lastLine));
            } else {
              const preview = lines.slice(0, 20).join('\n');
              if (lines.length > 20) {
                console.log(preview);
                console.log(chalk.dim(`  ... ${lines.length - 20} more lines`));
              } else {
                console.log(preview);
              }
            }
          }
        }
      }

      console.log('');
      printInfo(`Full execution: xpay run ${tool}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      printError(msg);
      process.exit(1);
    }
  });
