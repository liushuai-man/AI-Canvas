import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export default function ExportButton({ icon, label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
    >
      {icon}
      {label}
    </button>
  );
}
