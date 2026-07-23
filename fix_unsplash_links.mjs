import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const goodIds = [
  '1582719508461-905c673771fd',
  '1497366216548-37526070297c',
  '1519225421980-715cb0215aed',
  '1519741497674-611481863552',
  '1530103862676-de8c9debad1d',
  '1540541338287-41700207dee6'
]

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301)
    }).on('error', () => resolve(false))
  })
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(file)) continue
      getAllFiles(filePath, fileList)
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath)
      }
    }
  }
  return fileList
}

async function run() {
  const files = getAllFiles(process.cwd())
  const uniqueIds = new Set()
  const idRegex = /images\.unsplash\.com\/photo-([a-zA-Z0-9\-]+)/g

  const fileContents = new Map()

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    fileContents.set(file, content)
    let match;
    while ((match = idRegex.exec(content)) !== null) {
      uniqueIds.add(match[1])
    }
  }

  console.log(`Found ${uniqueIds.size} unique Unsplash IDs.`)
  const idStatus = new Map()

  for (const id of uniqueIds) {
    const isGood = await checkUrl(`https://images.unsplash.com/photo-${id}?w=10`)
    idStatus.set(id, isGood)
    console.log(`${id}: ${isGood ? 'OK' : 'BROKEN'}`)
  }

  let goodIndex = 0;
  for (const [file, content] of fileContents.entries()) {
    let newContent = content;
    let changed = false;

    // Replace broken IDs
    for (const [id, isGood] of idStatus.entries()) {
      if (!isGood) {
        const replaceRegex = new RegExp(`photo-${id}`, 'g')
        if (replaceRegex.test(newContent)) {
          const replacement = goodIds[goodIndex % goodIds.length]
          newContent = newContent.replace(replaceRegex, `photo-${replacement}`)
          changed = true
          goodIndex++
        }
      }
    }

    if (changed) {
      fs.writeFileSync(file, newContent)
      console.log(`Updated broken images in ${file}`)
    }
  }
}

run().catch(console.error)
