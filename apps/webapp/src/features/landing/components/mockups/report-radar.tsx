import { useIntl } from 'react-intl';
import { BrowserFrame } from '../browser-frame';

const CX = 80;
const CY = 70;
const R = 52;
const AXES = [
  { id: 'mockup.axis.communication', value: 82, angle: -90 },
  { id: 'mockup.axis.schedule', value: 88, angle: -18 },
  { id: 'mockup.axis.team', value: 74, angle: 54 },
  { id: 'mockup.axis.budget', value: 71, angle: 126 },
  { id: 'mockup.axis.risk', value: 65, angle: 198 },
] as const;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const point = (angle: number, radius: number) => ({ x: CX + radius * Math.cos(toRad(angle)), y: CY + radius * Math.sin(toRad(angle)) });
const polygon = (radiusOf: (value: number) => number) =>
  AXES.map((a, i) => {
    const p = point(a.angle, radiusOf(a.value));
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ') + ' Z';

/** Step 3 illustration: overall score, five-axis radar and the first recommendation. */
export function ReportRadarMockup() {
  const { formatMessage } = useIntl();
  const outer = polygon(() => R);
  const mid = polygon(() => R * 0.5);
  const data = polygon((v) => (R * v) / 100);

  return (
    <BrowserFrame url="app.simex-pro.com/rapport/erp-globalfinance">
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">{formatMessage({ id: 'mockup.globalScore' })}</p>
            <p className="font-display text-3xl font-extrabold leading-none text-[var(--accent-500)]">
              78<span className="text-base text-white/40">/100</span>
            </p>
          </div>
          <div className="flex-1">
            <svg viewBox="0 0 160 140" className="h-full max-h-[90px] w-full" role="img" aria-hidden="true">
              <path d={outer} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <path d={mid} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              {AXES.map((a) => {
                const p = point(a.angle, R);
                return <line key={a.id} x1={CX} y1={CY} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
              })}
              <path d={data} fill="rgba(238,122,58,0.25)" stroke="var(--accent-500)" strokeWidth="1.5" />
              {AXES.map((a) => {
                const p = point(a.angle, (R * a.value) / 100);
                return <circle key={a.id} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill="var(--accent-500)" />;
              })}
              {AXES.map((a) => {
                const p = point(a.angle, R + 14);
                return (
                  <text key={a.id} x={p.x.toFixed(1)} y={p.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="rgba(255,255,255,0.55)">
                    {a.value}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-[var(--accent-500)]/30 bg-white/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-400)]">{formatMessage({ id: 'mockup.recommendation' })}</p>
          <p className="text-[11px] leading-snug text-white/70">{formatMessage({ id: 'mockup.recommendationText' })}</p>
        </div>
      </div>
    </BrowserFrame>
  );
}
