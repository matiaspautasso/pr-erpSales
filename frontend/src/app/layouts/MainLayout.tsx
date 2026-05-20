import { Outlet, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/productos', label: 'Productos' },
  { to: '/compras', label: 'Compras' },
  { to: '/proveedores', label: 'Proveedores' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/caja', label: 'Caja' },
];

export function MainLayout() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-title text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading text-xl font-semibold">Pollería Santi</h1>
          <p className="text-sm text-white/60 mt-1 font-body">Sistema de Gestión</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-body text-sm rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
