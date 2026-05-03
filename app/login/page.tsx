import { redirect } from 'next/navigation'
// /login redirected — sign in at /signon
export default function LoginRedirect() { redirect('/signon') }
