#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Quick Login Helper - Copy token to clipboard for instant login
 * Usage: npm run quick-login [email]
 */

const tokensPath = path.join(__dirname, '../tokens.json');

if (!fs.existsSync(tokensPath)) {
  console.error('❌ tokens.json not found. Run "npm run generate-tokens" first');
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
const email = process.argv[2] || 'manager1@aneat.com';

const user = tokens.find((t: any) => t.email === email);

if (!user) {
  console.log('❌ User not found:', email);
  console.log('\n📋 Available users:');
  tokens.forEach((t: any) => {
    console.log(`   - ${t.email} (${t.name}, ${t.role})`);
  });
  process.exit(1);
}

console.log('🎯 Selected User:');
console.log(`   Name: ${user.name}`);
console.log(`   Email: ${user.email}`);
console.log(`   Role: ${user.role}`);
console.log(`   Branch: ${user.branch || 'N/A'}`);
console.log('');

// Generate console script
const consoleScript = `
// Quick Auto-Login for ${user.name}
localStorage.setItem('token', '${user.token}');
localStorage.setItem('user', '${JSON.stringify({
  id: user.userId,
  email: user.email,
  name: user.name,
  role: user.role,
  branchId: user.branchId,
  branchName: user.branch
})}');
console.log('✅ Logged in as ${user.name}');
window.location.reload();
`.trim();

// Try to copy to clipboard
try {
  if (process.platform === 'darwin') {
    // macOS
    execSync('pbcopy', { input: consoleScript });
    console.log('✅ Console script COPIED to clipboard!');
  } else if (process.platform === 'linux') {
    // Linux
    execSync('xclip -selection clipboard', { input: consoleScript });
    console.log('✅ Console script COPIED to clipboard!');
  } else if (process.platform === 'win32') {
    // Windows
    execSync('clip', { input: consoleScript });
    console.log('✅ Console script COPIED to clipboard!');
  }
  
  console.log('\n📋 How to use:');
  console.log('   1. Open frontend in browser (http://localhost:3000)');
  console.log('   2. Press F12 to open DevTools Console');
  console.log('   3. Paste and press Enter');
  console.log('   4. Page will reload with auto-login! 🚀');
} catch (error) {
  console.log('⚠️  Could not copy to clipboard automatically');
  console.log('\n📋 Copy this script manually:');
  console.log('═'.repeat(80));
  console.log(consoleScript);
  console.log('═'.repeat(80));
}

// Also show Postman token
console.log('\n\n🔧 For Postman:');
console.log('Authorization: Bearer ' + user.token);
console.log('\n💡 Token valid for 7 days');
