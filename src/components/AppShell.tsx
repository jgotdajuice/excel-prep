import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface AppShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Learn', to: '/learn' },
  { label: 'Challenges', to: '/challenge' },
  { label: 'Rapid-Fire Drill', to: '/drill' },
  { label: 'Keyboard Shortcuts', to: '/shortcuts' },
  { label: 'Progress', to: '/progress' },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-12 min-h-12 bg-brand-dark flex items-center px-4 shrink-0 shadow-md">
        <Link
          to="/"
          className="text-white text-lg font-bold tracking-tight no-underline"
        >
          ExcelPrep
        </Link>
      </header>

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-[220px] min-w-[220px] bg-base border-r border-border flex flex-col py-4 shrink-0 overflow-y-auto">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-4 mb-2">
            Topics
          </p>
          <ul className="list-none m-0 p-0">
            {NAV_ITEMS.map((item) =>
              item.disabled ? (
                <li
                  key={item.label}
                  className="py-2 px-4 text-[13px] text-muted/60 font-normal cursor-default border-l-3 border-transparent"
                >
                  {item.label}
                </li>
              ) : (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        'block py-2 px-4 text-[13px] no-underline border-l-3 transition-colors',
                        isActive
                          ? 'text-brand-dark font-semibold border-brand'
                          : 'text-text-primary/70 font-normal border-transparent hover:bg-base hover:text-text-primary'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </aside>

        {/* Main content area — fills remaining space */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
