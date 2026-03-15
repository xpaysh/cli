const BASE_URL = 'https://xpay.tools';

export async function fetchSkillMd(path: string): Promise<string> {
  const url = `${BASE_URL}/skills/${path}/SKILL.md`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch skill: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export async function searchSkills(query: string): Promise<string> {
  // Fetch the master skill.md and search within it
  const res = await fetch(`${BASE_URL}/skill.md`);
  if (!res.ok) {
    throw new Error(`Failed to fetch skill index: ${res.status}`);
  }
  const content = await res.text();

  const lines = content.split('\n');
  const matches = lines.filter(
    (line) =>
      line.toLowerCase().includes(query.toLowerCase()) &&
      (line.includes('**') || line.includes('###'))
  );

  return matches.length > 0
    ? matches.join('\n')
    : `No results found for "${query}". Try a broader search.`;
}

export async function listRemoteSkills(): Promise<string> {
  const res = await fetch(`${BASE_URL}/skill.md`);
  if (!res.ok) {
    throw new Error(`Failed to fetch skill index: ${res.status}`);
  }
  return res.text();
}
