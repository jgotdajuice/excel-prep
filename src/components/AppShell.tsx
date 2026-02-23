import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';

interface AppShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Challenges', to: '/challenge' },
  { label: 'Rapid-Fire Drill', to: '/drill' },
  { label: 'Keyboard Shortcuts', to: '/shortcuts' },
  { label: 'Progress', to: '/progress' },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          height: '48px',
          minHeight: '48px',
          backgroundColor: '#1a3a2a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        <Link
          to="/"
          style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
            textDecoration: 'none',
          }}
        >
          ExcelPrep
        </Link>
      </header>

      {/* Body: sidebar + main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <aside
          style={{
            width: '220px',
            minWidth: '220px',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #d0d0d0',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 0',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '0 16px',
              margin: '0 0 8px 0',
            }}
          >
            Topics
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_ITEMS.map((item) =>
              item.disabled ? (
                <li
                  key={item.label}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#aaa',
                    fontWeight: 400,
                    cursor: 'default',
                    borderLeft: '3px solid transparent',
                  }}
                >
                  {item.label}
                </li>
              ) : (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    style={({ isActive }) => ({
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: '13px',
                      textDecoration: 'none',
                      color: isActive ? '#1a3a2a' : '#555',
                      fontWeight: isActive ? 600 : 400,
                      borderLeft: isActive ? '3px solid #1a6b3c' : '3px solid transparent',
                    })}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </aside>

        {/* Main content area — fills remaining space */}
        <main
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
