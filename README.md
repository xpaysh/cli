# @xpaysh/cli

CLI for discovering and installing [xpay](https://xpay.tools) skills for AI agents.

Skills are SKILL.md files that teach AI agents (Claude Code, OpenClaw, Cursor) **when** and **how** to use pay-per-use tools through xpay's MCP proxy.

## Install

```bash
npm install -g @xpaysh/cli
```

Or use directly with npx:

```bash
npx @xpaysh/cli search firecrawl
```

## Commands

### Search for skills

```bash
xpay search <query>
```

### Install a skill

```bash
# Install a provider skill (all tools)
xpay install firecrawl

# Install a specific tool skill
xpay install firecrawl/scrape

# Install a collection skill
xpay install --collection web-scraping-toolkit
```

The CLI auto-detects your AI agent (Claude Code, OpenClaw, Cursor) and writes the SKILL.md to the correct directory.

### List skills

```bash
# List installed skills
xpay list

# List all available skills from xpay.tools
xpay list --remote
```

### Configure

```bash
xpay config set api-key YOUR_API_KEY
```

## How it works

1. Skills are fetched from `https://xpay.tools/skills/{provider}/{tool}/SKILL.md`
2. Written to your agent's skills directory (e.g., `~/.claude/skills/`)
3. Your AI agent reads the SKILL.md to learn when and how to use the tool
4. Tool execution goes through xpay's MCP proxy — no direct API calls needed

## MCP Setup

After installing skills, make sure your agent has the xpay MCP server configured:

```bash
# Claude Code
claude mcp add --transport http xpay "https://mcp.xpay.sh/mcp?key=YOUR_API_KEY"
```

Get your API key at [xpay.tools](https://xpay.tools) — $5 free credits included.

## Links

- [Browse skills](https://xpay.tools/skills)
- [Documentation](https://docs.xpay.sh)
- [xpay.tools](https://xpay.tools)

## License

MIT
