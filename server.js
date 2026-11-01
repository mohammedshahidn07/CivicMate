import { spawn } from 'node:child_process';

const child = spawn(
  'npx',
  ['nitrostack-cli', 'start', '--port', '8012'],
  {
    stdio: 'inherit',
    shell: true,
    env: process.env
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 1);
});