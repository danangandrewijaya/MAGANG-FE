// -- Write latest commit info to utils/appversion.js
const { exec } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { exit } = require('node:process')

const gitPath = path.resolve(__dirname, '.git')
const versionPath = path.resolve(__dirname, 'utils/appVersion.ts')

exec(`git --git-dir=${gitPath} log -1 --pretty=format:"%h %ad %d"`, (err, stdout, stderr) => {
  if (err) {
    console.log(`Error getting latest commit info: ${stderr}`)
    exit(1)
  }
  else {
    const strCurrentTime = new Date().toString()
    const commitInfo = stdout.replace(/"/g, '\\"').replace(/\n/g, '\\n')

    const jsScript = `export const appVersion = {
  buildDate: '${strCurrentTime}',
  commit: '${commitInfo}',
}`

    fs.writeFileSync(versionPath, jsScript)
  }
})
