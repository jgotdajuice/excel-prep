interface FormulaBarProps {
  formula: string | undefined;
  value: number | string | boolean | null;
  cellLabel: string;
}

export function FormulaBar({ formula, value, cellLabel }: FormulaBarProps) {
  const displayText = formula !== undefined ? formula : (value !== null && value !== undefined ? String(value) : '');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '28px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #d0d0d0',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: '13px',
        flexShrink: 0,
      }}
    >
      {/* Cell reference box */}
      <div
        style={{
          width: '60px',
          minWidth: '60px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #d0d0d0',
          backgroundColor: '#fff',
          fontWeight: 600,
          fontSize: '12px',
          color: '#333',
        }}
      >
        {cellLabel || 'A1'}
      </div>

      {/* fx label */}
      <div
        style={{
          width: '32px',
          minWidth: '32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #d0d0d0',
          color: '#555',
          fontStyle: 'italic',
          fontSize: '13px',
        }}
      >
        fx
      </div>

      {/* Formula / value display */}
      <div
        style={{
          flex: 1,
          padding: '0 8px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          color: '#1a1a1a',
        }}
      >
        {displayText}
      </div>
    </div>
  );
}
