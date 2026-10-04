// Development helper only. Usage: node scripts/generate_demo_password_hashes.js password
const bcrypt=require('../backend/node_modules/bcrypt'); const password=process.argv[2]; if(!password){console.error('Usage: node scripts/generate_demo_password_hashes.js <development-password>');process.exit(1);} bcrypt.hash(password,12).then(h=>console.log(h));
