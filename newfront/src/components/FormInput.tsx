import React from 'react';

interface FormInputProps {
  label: string;
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  helperText?: string;
  max?: number;
  min?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
}

export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  value,
  placeholder,
  helperText,
  max,
  min,
  onChange,
  className = '',
  icon,
  readOnly,
}: FormInputProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          readOnly={readOnly}
          min={min}
          max={max}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {icon ? <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">{icon}</div> : null}
      </div>
      {helperText ? <p className="mt-2 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
