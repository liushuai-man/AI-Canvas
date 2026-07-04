import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  onClick?: () => void;
}

export default function FooterButton({ icon, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className=""
    >
      {icon}
    </button>
  );
}
