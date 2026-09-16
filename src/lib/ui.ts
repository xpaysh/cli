import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import Table from 'cli-table3';
import figures from 'figures';

// --- Spinner ---

export function spinner(text: string): Ora {
  return ora({ text, spinner: 'dots' });
}

// --- Status messages ---

export function printSuccess(msg: string): void {
  console.log(`${chalk.green(figures.tick)} ${msg}`);
}

export function printError(msg: string): void {
  console.log(`${chalk.red(figures.cross)} ${msg}`);
}

export function printWarning(msg: string): void {
  console.log(`${chalk.yellow(figures.warning)} ${msg}`);
}

export function printInfo(msg: string): void {
  console.log(`${chalk.blue(figures.info)} ${msg}`);
}

// --- Box ---

export function printBox(title: string, lines: string[]): void {
  const content = lines.join('\n');
  const allLines = title ? [chalk.bold(title), '', ...lines] : lines;
  const maxLen = Math.max(...allLines.map((l) => stripAnsi(l).length), 40);
  const border = chalk.dim('─'.repeat(maxLen + 2));

  console.log(`╭${border}╮`);
  for (const line of allLines) {
    const pad = maxLen - stripAnsi(line).length;
    console.log(`│ ${line}${' '.repeat(Math.max(0, pad))} │`);
  }
  console.log(`╰${border}╯`);
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// --- Table ---

export function printTable(
  head: string[],
  rows: string[][],
  options?: { compact?: boolean }
): void {
  const table = new Table({
    head: head.map((h) => chalk.bold.cyan(h)),
    style: { head: [], border: [], compact: options?.compact },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
  });
  for (const row of rows) {
    table.push(row);
  }
  console.log(table.toString());
}

// --- Formatting ---

export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return chalk.dim('free');
  if (price < 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// --- Progress bar ---

export function progressBar(current: number, max: number, width = 20): string {
  const ratio = Math.min(current / max, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const color = ratio > 0.9 ? chalk.red : ratio > 0.7 ? chalk.yellow : chalk.green;
  return `${color('█'.repeat(filled))}${chalk.dim('░'.repeat(empty))} ${(ratio * 100).toFixed(0)}%`;
}

// --- Checklist ---

export function printCheck(pass: boolean, label: string): void {
  const icon = pass ? chalk.green(figures.tick) : chalk.red(figures.cross);
  console.log(`  ${icon} ${label}`);
}

// --- Divider ---

export function divider(): void {
  console.log(chalk.dim('─'.repeat(50)));
}
