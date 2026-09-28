import bcrypt from 'bcryptjs';
const hash = '$2b$10$WydnvD6fjOewqjHXSLz/rONar6dKe78qy2p/UQaRbVVQHA99wniZ.';
const result = bcrypt.compareSync('StacklyWFA2026!', hash);
console.log('Verify:', result);
const newHash = bcrypt.hashSync('StacklyWFA2026!', 10);
console.log('New hash:', newHash);
console.log('New verify:', bcrypt.compareSync('StacklyWFA2026!', newHash));
