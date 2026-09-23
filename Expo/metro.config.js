const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@common': path.resolve(workspaceRoot, 'COMMON.ts'),
};

config.resolver.blockList = [
  /.*[/\\](?:NestJS|Next\.js|\.git)[/\\].*/,
];

module.exports = config;
