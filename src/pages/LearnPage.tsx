import { useNavigate } from 'react-router-dom';
import { functionReferences } from '../data/functions';
import { useChallengeStore } from '../store/challengeStore';
import { Card } from '../components/ui/Card';
import type { Tier, FunctionReference } from '../types';

const TIERS: { tier: Tier; label: string }[] = [
  { tier: 'beginner', label: 'Beginner' },
  { tier: 'intermediate', label: 'Intermediate' },
  { tier: 'advanced', label: 'Advanced' },
];

function FunctionCard({ fn }: { fn: FunctionReference }) {
  const navigate = useNavigate();
  const setActiveTier = useChallengeStore((s) => s.setActiveTier);

  function handlePractice() {
    setActiveTier(fn.tier);
    navigate('/challenge');
  }

  return (
    <details className="border border-border rounded-card overflow-hidden bg-surface">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-base/60 transition-colors">
        <div className="flex items-center gap-2.5">
          <code className="text-sm font-bold text-brand-dark bg-brand-light px-2 py-0.5 rounded">
            {fn.name}
          </code>
          <span className="text-[13px] text-text-primary">{fn.description}</span>
        </div>
      </summary>

      <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-border">
        {/* Syntax */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide m-0 mb-1">Syntax</p>
          <code className="block font-mono text-[13px] bg-base text-brand-dark rounded-btn py-1.5 px-2.5 break-all">
            {fn.syntax}
          </code>
        </div>

        {/* Parameters */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide m-0 mb-1">Parameters</p>
          <ul className="m-0 pl-4 flex flex-col gap-0.5">
            {fn.parameters.map((p) => (
              <li key={p.name} className="text-xs text-text-primary">
                <code className="font-mono text-brand-dark">{p.name}</code>
                {p.optional && <span className="text-muted italic"> (optional)</span>}
                {' \u2014 '}{p.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Example */}
        <div className="bg-brand-light/40 border border-green-200 rounded-btn px-3 py-2.5">
          <p className="text-[11px] font-semibold text-brand uppercase tracking-wide m-0 mb-1">Example</p>
          <p className="text-xs text-text-primary m-0 mb-1">{fn.example.scenario}</p>
          <code className="block font-mono text-[13px] text-brand-dark bg-white/60 rounded px-2 py-1 mb-1">
            {fn.example.formula}
          </code>
          <p className="text-xs text-muted m-0">
            Result: <strong className="text-brand-dark">{fn.example.result}</strong>
          </p>
        </div>

        {/* When to use */}
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide m-0 mb-1">When to use</p>
          <p className="text-xs text-text-primary m-0 leading-relaxed">{fn.whenToUse}</p>
        </div>

        {/* Practice link */}
        <button
          onClick={handlePractice}
          className="self-start px-3 py-1.5 text-[13px] font-semibold bg-brand text-white rounded-btn border-none cursor-pointer transition-opacity duration-150 hover:opacity-85"
        >
          Practice {fn.name}
        </button>
      </div>
    </details>
  );
}

export function LearnPage() {
  return (
    <div className="overflow-y-auto h-full py-8 px-10 bg-base">
      <div className="max-w-[720px] mx-auto">
        <h1 className="text-xl font-bold text-brand-dark mb-2">Formula Reference</h1>
        <p className="text-sm text-muted mb-7">
          Learn the key Excel functions used in finance interviews. Expand any function to see its syntax, parameters, and a worked example.
        </p>

        {TIERS.map(({ tier, label }) => {
          const fns = functionReferences.filter((f) => f.tier === tier);
          return (
            <Card key={tier} shadow className="mb-5">
              <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide m-0 mb-4">
                {label}
              </h2>
              <div className="flex flex-col gap-2">
                {fns.map((fn) => (
                  <FunctionCard key={fn.name} fn={fn} />
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
