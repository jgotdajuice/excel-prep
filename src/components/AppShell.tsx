import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: 'Formula Practice', active: true },
  { label: 'Keyboard Shortcuts', active: false },
  { label: 'Progress', active: false },
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
        <span
          style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
          }}
        >
          ExcelPrep
        </span>
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
            {NAV_ITEMS.map((item) => (
              <li
                key={item.label}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: item.active ? '#1a3a2a' : '#aaa',
                  fontWeight: item.active ? 600 : 400,
                  cursor: item.active ? 'pointer' : 'default',
                  borderLeft: item.active ? '3px solid #1a6b3c' : '3px solid transparent',
                }}
              >
                {item.label}
              </li>
            ))}
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
