import { useShortcutStore } from '../store/shortcutStore';
import { ShortcutSetup } from '../components/shortcuts/ShortcutSetup';
import { ShortcutDrill } from '../components/shortcuts/ShortcutDrill';
import { ShortcutSummary } from '../components/shortcuts/ShortcutSummary';

export function ShortcutsPage() {
  const drillState = useShortcutStore((s) => s.drillState);

  return (
    <div className="p-6 overflow-y-auto h-full">
      {drillState === 'idle' && <ShortcutSetup />}
      {(drillState === 'drilling' || drillState === 'feedback') && <ShortcutDrill />}
      {drillState === 'summary' && <ShortcutSummary />}
    </div>
  );
}
