interface DrillFeedbackProps {
  status: 'correct' | 'incorrect';
  correctFormula: string;
}

export function DrillFeedback({ status, correctFormula }: DrillFeedbackProps) {
  const isCorrect = status === 'correct';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isCorrect ? 'rgba(22, 101, 52, 0.95)' : 'rgba(153, 27, 27, 0.95)',
        borderRadius: '12px',
        animation: 'fadeIn 0.15s ease-in',
        zIndex: 10,
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          fontSize: '48px',
          marginBottom: '8px',
          lineHeight: 1,
        }}
      >
        {isCorrect ? '✓' : '✗'}
      </div>

      <div
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '16px',
        }}
      >
        {isCorrect ? 'Correct!' : 'Incorrect'}
      </div>

      <div
        style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}
      >
        Correct answer
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '15px',
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '8px 16px',
          borderRadius: '6px',
          wordBreak: 'break-all',
          maxWidth: '480px',
        }}
      >
        {correctFormula}
      </div>
    </div>
  );
}
