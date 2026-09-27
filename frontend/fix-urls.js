const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

const files = walk(path.join(__dirname, 'app'));
let changedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('localhost:5000')) {
    let updated = content.replace(
      /`http:\/\/localhost:5000/g,
      "`${process.env.NEXT_PUBLIC_API_URL || ''}"
    );
    updated = updated.replace(
      /'http:\/\/localhost:5000([^']*)'/g,
      "`${process.env.NEXT_PUBLIC_API_URL || ''}$1`"
    );

    if (updated !== content) {
      fs.writeFileSync(file, updated, 'utf8');
      console.log('Updated:', file);
      changedCount++;
    }
  }
});

console.log(`\nDone. Updated ${changedCount} files.`);