import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function WelcomePage() {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setHasStarted(localStorage.getItem('hasStarted') === 'true');
  }, []);

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-base p-6">
      <Card shadow className="max-w-[480px] w-full text-center px-14 py-12">
        {/* App name */}
        <h1 className="text-3xl font-bold text-brand-dark mb-3 tracking-tight">
          ExcelPrep
        </h1>

        {/* Brief description */}
        <p className="text-base text-muted mb-8 leading-relaxed">
          Practice Excel formulas for finance interviews — SUM, VLOOKUP, NPV, IRR, and more.
        </p>

        {/* How it works */}
        <div className="text-left mb-8 space-y-3">
          <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-wide mb-3">
            How it works
          </h2>
          <div className="flex items-start gap-3">
            <span className="text-brand font-bold text-lg leading-none mt-0.5">1</span>
            <p className="text-sm text-text-primary m-0">
              <span className="font-semibold">Practice with real formulas.</span>{' '}
              Type SUM, VLOOKUP, INDEX-MATCH and more in a live spreadsheet grid.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-brand font-bold text-lg leading-none mt-0.5">2</span>
            <p className="text-sm text-text-primary m-0">
              <span className="font-semibold">Get instant feedback.</span>{' '}
              Your formula is graded immediately -- see what was wrong and why.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-brand font-bold text-lg leading-none mt-0.5">3</span>
            <p className="text-sm text-text-primary m-0">
              <span className="font-semibold">Track your progress.</span>{' '}
              The app identifies your weak areas and suggests what to practice next.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/challenge')} className="py-3 text-base">
            Start Challenge
          </Button>
          <Button variant="secondary" onClick={() => navigate('/practice')} className="py-2.5 text-sm">
            {hasStarted ? 'Continue Practicing' : 'Free Practice'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
