module.exports = {
  diff: true,
  extension: ['ts', 'json'],
  package: './package.json',
  reporter: 'spec',
  spec: './__tests__/**/*.ts',
  slow: '75',
  timeout: '2000',
  ui: 'bdd',
  'fail-zero': true,
  'watch-files': ['__tests__/**/*.ts', 'src/**/*.ts'],
  'watch-ignore': ['lib/**/*', 'node_modules'],
  file: ['./__tests__/setup.ts'],
  ignore: ['./__tests__/setup.ts'],
  require: ['ts-node/register']
};
