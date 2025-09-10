const fs = require('fs');
const path = require('path');
const cp = require('child_process');

cp.spawnSync('gql-gen', { stdio: 'inherit' });

process.stdout.write('GraphQL Server Codegen Completed\n');
const file = path.join(__dirname, '../src/typings/schema.d.ts')
const output = fs.readFileSync(file).toString();
const lines = output.split('\n').map((line) => line.length > 0 ? `  ${line}` : line);
const length = lines.length;
const outputLines = lines[lines.length - 1] === '' ? lines.slice(0, length - 1) : lines;
const firstLine = 'declare namespace Schema {';
const lastLine = '}';
outputLines.unshift(firstLine);
outputLines.push(lastLine);
outputLines.push('');
const result = outputLines.join('\n');
fs.writeFileSync(file, result);
process.stdout.write('Types declared in namespace\n');
