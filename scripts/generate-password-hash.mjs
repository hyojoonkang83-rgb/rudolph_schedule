import { createHash } from 'crypto';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('');
console.log('🔐 비밀번호 해시 생성 도구');
console.log('💡 권장: 12자 이상 passphrase (예: rudolph-design-2026)');
console.log('');

rl.question('비밀번호: ', (password) => {
  password = password.trim();
  if (!password) {
    console.error('❌ 비밀번호 비어있음');
    process.exit(1);
  }

  if (password.length < 8) {
    console.warn('⚠️  비밀번호가 8자 미만입니다. 보안상 12자+ 권장.');
  }

  const hash = createHash('sha256').update(password).digest('hex');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SHA-256 해시:');
  console.log(hash);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Supabase SQL Editor에서 이 SQL 실행:');
  console.log('');
  console.log(`INSERT INTO site_config (key, value)`);
  console.log(`VALUES ('access_password_hash', '${hash}')`);
  console.log(`ON CONFLICT (key) DO UPDATE SET value = '${hash}', updated_at = now();`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  rl.close();
});
