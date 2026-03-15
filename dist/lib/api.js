"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSkillMd = fetchSkillMd;
exports.searchSkills = searchSkills;
exports.listRemoteSkills = listRemoteSkills;
const BASE_URL = 'https://xpay.tools';
async function fetchSkillMd(path) {
    const url = `${BASE_URL}/skills/${path}/SKILL.md`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch skill: ${res.status} ${res.statusText}`);
    }
    return res.text();
}
async function searchSkills(query) {
    // Fetch the master skill.md and search within it
    const res = await fetch(`${BASE_URL}/skill.md`);
    if (!res.ok) {
        throw new Error(`Failed to fetch skill index: ${res.status}`);
    }
    const content = await res.text();
    const lines = content.split('\n');
    const matches = lines.filter((line) => line.toLowerCase().includes(query.toLowerCase()) &&
        (line.includes('**') || line.includes('###')));
    return matches.length > 0
        ? matches.join('\n')
        : `No results found for "${query}". Try a broader search.`;
}
async function listRemoteSkills() {
    const res = await fetch(`${BASE_URL}/skill.md`);
    if (!res.ok) {
        throw new Error(`Failed to fetch skill index: ${res.status}`);
    }
    return res.text();
}
