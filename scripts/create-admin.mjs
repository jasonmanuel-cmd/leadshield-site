import { createClient } from '@supabase/supabase-js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')

const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map(l => l.split('=')).map(([k, ...v]) => [k.trim(), v.join('=').trim()])
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const email = 'jasonm@coaibakersfield.com'
const password = 'Coaiblunts1989'

// Check if user already exists
const { data: existing } = await supabase.auth.admin.listUsers()
const found = existing?.users.find(u => u.email === email)

if (found) {
  console.log('User already exists:', found.id)

  // Reset password to ensure it matches
  const { error: pwErr } = await supabase.auth.admin.updateUserById(found.id, { password })
  if (pwErr) { console.error('Password reset error:', pwErr.message) }
  else { console.log('Password reset to configured value') }

  const { data: client, error: cErr } = await supabase.from('clients').select('id, role').eq('id', found.id).single()
  if (cErr && cErr.code === 'PGRST116') {
    const { error: insertErr } = await supabase.from('clients').insert({
      id: found.id,
      email,
      business_name: 'LeadShield Admin',
      role: 'admin',
      created_at: new Date().toISOString(),
    })
    if (insertErr) { console.error('Insert error:', insertErr.message); process.exit(1) }
    console.log('Inserted admin client record')
  } else if (client) {
    const { error: updateErr } = await supabase.from('clients').update({ role: 'admin' }).eq('id', found.id)
    if (updateErr) { console.error('Update error:', updateErr.message); process.exit(1) }
    console.log('Updated existing client to admin role')
  }
} else {
  const { data: user, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr) { console.error('Create error:', createErr.message); process.exit(1) }
  console.log('Created auth user:', user.user.id)

  const { error: insertErr } = await supabase.from('clients').insert({
    id: user.user.id,
    email,
    business_name: 'LeadShield Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
  })
  if (insertErr) { console.error('Insert error:', insertErr.message); process.exit(1) }
  console.log('Inserted admin client record')
}

console.log('\nAdmin setup complete!')
console.log('  Email:', email)
console.log('  Password:', password)
console.log('  URL:    http://localhost:3000/signon')
