import { Sidebar } from '@/components/layout/Sidebar'

// A checagem de sessão já acontece no middleware (proxy.ts) para toda rota
// sob este grupo — repeti-la aqui só adicionava uma segunda chamada de rede
// ao Supabase Auth em cada clique de navegação, dobrando a demora sem
// nenhum ganho de segurança (o middleware já bloqueia antes de chegar aqui).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
