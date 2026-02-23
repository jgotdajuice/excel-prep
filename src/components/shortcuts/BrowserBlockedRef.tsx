import { browserBlockedShortcuts } from '../../data/shortcuts';

export function BrowserBlockedRef() {
  return (
    <div style={{ marginTop: '32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '16px' }}>&#9888;</span>
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#555',
          }}
        >
          Browser-Blocked Shortcuts
        </h3>
      </div>
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          color: '#888',
        }}
      >
        These shortcuts cannot be practiced in a browser but are important for Excel.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {browserBlockedShortcuts.map((s) => (
          <div
            key={s.id}
            style={{
              backgroundColor: '#f8f8f8',
              border: '1px solid #e0e0e0',
              borderLeft: '3px solid #aaa',
              borderRadius: '6px',
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>
                {s.action}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: '#e8e8e8',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  color: '#333',
                  whiteSpace: 'nowrap',
                  marginLeft: '12px',
                }}
              >
                {s.keys.windows.join(' + ')}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{s.financeContext}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
