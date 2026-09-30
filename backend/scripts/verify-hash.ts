import bcrypt from 'bcryptjs';
const hash = '$2b$10$bV6Bn0GPPdTcaqC0X8AWkuLm/ZwNDpZZzxcxifKgTd8fdBAAhZ9Mu';
const result = bcrypt.compareSync('StacklyWFA2026!', hash);
console.log('Verify:', result);
const newHash = bcrypt.hashSync('StacklyWFA2026!', 10);
console.log('New hash:', newHash);
console.log('New verify:', bcrypt.compareSync('StacklyWFA2026!', newHash));
