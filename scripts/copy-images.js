const fs = require('fs')
const path = require('path')

const srcDir = path.resolve(__dirname, '..', 'image')
const destDir = path.resolve(__dirname, '..', 'public', 'image')

function copyDir(src, dest){
  if (!fs.existsSync(src)){
    console.warn('Source image directory does not exist:', src)
    return
  }
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

  const entries = fs.readdirSync(src)
  for (const entry of entries){
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()){
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

try{
  copyDir(srcDir, destDir)
  console.log('Images copied to', destDir)
} catch (err){
  console.error('Failed to copy images:', err)
  process.exit(1)
}
