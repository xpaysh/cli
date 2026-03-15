"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSkill = writeSkill;
exports.listInstalledSkills = listInstalledSkills;
exports.getConfigPath = getConfigPath;
exports.readConfig = readConfig;
exports.writeConfig = writeConfig;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
function writeSkill(agent, skillName, content) {
    const skillDir = path.join(agent.skillsDir, skillName);
    fs.mkdirSync(skillDir, { recursive: true });
    const filePath = path.join(skillDir, 'SKILL.md');
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
}
function listInstalledSkills(agent) {
    if (!fs.existsSync(agent.skillsDir)) {
        return [];
    }
    return fs
        .readdirSync(agent.skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .filter((d) => fs.existsSync(path.join(agent.skillsDir, d.name, 'SKILL.md')))
        .map((d) => d.name);
}
function getConfigPath() {
    return path.join(os.homedir(), '.xpay', 'config.json');
}
function readConfig() {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
function writeConfig(key, value) {
    const configPath = getConfigPath();
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    const config = readConfig();
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
