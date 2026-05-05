import { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  caption: string;
  accent?: string;
  icon?: ReactNode;
  footer?: ReactNode;
}

export default function MetricCard({
  title,
  value,
  caption,
  accent,
  icon,
  footer,
}: MetricCardProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase  text-slate-400">
            {title}
          </p>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{value}</h2>
        </div>
        <div className="flex p-3 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700">
          {icon}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-3 text-sm text-slate-500">
        <p>{caption}</p>
        {accent ? (
          <span className="rounded-full bg-emerald-100  text-center p-2 text-[12px] text-emerald-700">{accent}</span>
        ) : null}
      </div>

      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
