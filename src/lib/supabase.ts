import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Falha alto e claro em vez de deixar o app "funcionar" sem banco e confundir
// quem estiver testando — sem essas duas variáveis nada mais funciona.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam as variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Veja supabase/README.md para configurar o arquivo .env.local.',
  )
}

// A anon key é pública por natureza (ver supabase/README.md) — ela só é
// segura porque toda tabela tem Row Level Security ativo (ver SECURITY.md).
// Nunca use a service_role key aqui.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
