import { createClient } from '@supabase/supabase-js'

// Proyecto del club. La URL y la clave publishable son públicas por diseño (van en el navegador de todos
// los visitantes); lo que protege los datos son las políticas RLS. Se pueden cambiar con VITE_SUPABASE_URL
// y VITE_SUPABASE_PUBLISHABLE_KEY (p. ej. en .env.local para usar otro proyecto).
const url = import.meta.env.VITE_SUPABASE_URL || 'https://txdcijwmstrpfzgknxhz.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_6p2UmLbV-YBgX6pWWA5USw_q1Hx4Ov9'

export const supabase = createClient(url, key)
