import { clsx } from 'clsx';

interface DrillFeedbackProps {
  status: 'correct' | 'incorrect';
  correctFormula: string;
}

export function DrillFeedback({ status, correctFormula }: DrillFeedbackProps) {
  const isCorrect = status === 'correct';

  return (
    <div
      className={clsx(
        'absolute inset-0 flex flex-col items-center justify-center rounded-card z-10 p-6 text-center',
        isCorrect ? 'bg-green-800/95 animate-correct-flash' : 'bg-red-800/95 animate-incorrect-shake'
      )}
    >
      <div className="text-5xl mb-2 leading-none">
        {isCorrect ? '✓' : '✗'}
      </div>

      <div className="text-2xl font-bold text-white mb-4">
        {isCorrect ? 'Correct!' : 'Incorrect'}
      </div>

      <div className="text-[13px] text-white/75 uppercase tracking-wide mb-1.5">
        Correct answer
      </div>

      <div className="font-mono text-[15px] text-white bg-black/30 px-4 py-2 rounded-md break-all max-w-[480px]">
        {correctFormula}
      </div>
    </div>
  );
}
