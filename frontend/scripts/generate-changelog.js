import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const log = execSync('git log --pretty=format:%h%x09%ad%x09%s --date=short', {
  cwd: root,
  encoding: 'utf-8'
})

const entries = log
  .trim()
  .split('\n')
  .map(line => {
    const [hash, date, ...messageParts] = line.split('\t')
    const message = messageParts.join('\t')
    return { hash, date, message }
  })

const outFile = path.join(root, 'public', 'changelog.json')
writeFileSync(outFile, JSON.stringify(entries, null, 2))
console.log(`Generated changelog with ${entries.length} entries`) 
