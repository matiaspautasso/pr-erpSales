import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-title text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading text-xl font-semibold">Pollería Santi</h1>
          <p className="text-sm text-white/60 mt-1 font-body">Sistema de Gestión</p>
        </div>
        <nav className="flex-1 p-4">
          <p className="text-white/40 text-sm font-body">
            Módulos disponibles próximamente
          </p>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
