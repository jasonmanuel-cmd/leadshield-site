import { redirect } from 'next/navigation'

// /beta redirects to the main landing page signup section.
// The full beta signup, pricing, and app announcement all live at /.
export default function BetaPage() {
  redirect('/#signup')
}
