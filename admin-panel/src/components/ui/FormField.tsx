import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  description?: string;
}

export function FormField({ label, children, error, description }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
