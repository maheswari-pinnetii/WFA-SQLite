const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') && !file.endsWith('sqlite-cloud.ts') && !file.endsWith('connection.ts') && !file.endsWith('db.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./backend/src');
let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/from\s+['"]([^'"]+)sqlite-cloud(\.js)?['"]/g, (match, p1) => {
    return 'from \'' + p1 + 'connection.js\'';
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated', file);
    count++;
  }
}
console.log('Replaced in ' + count + ' files.');
