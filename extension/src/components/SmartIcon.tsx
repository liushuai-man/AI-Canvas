type IconType = 'pdf' | 'md' | 'txt' | 'html' | 'json' | 'notion';

interface Props {
  type: IconType;
  onClick?: () => void;
}

export default function SmartIcon({ type, onClick }: Props) {
  const base =
    'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95';

  const map = {
    pdf: {
      bg: 'bg-red-500',
      content: 'PDF',
    },
    image: {
      bg: 'bg-green-500',
      content: (
        <svg width="14" height="14" fill="currentColor">
          <circle cx="8" cy="8" r="3" />
          <rect x="2" y="14" width="12" height="6" rx="1" />
        </svg>
      ),
    },

    md: {
      bg: 'bg-blue-500',
      content: 'MD',
    },

    txt: {
      bg: 'bg-yellow-500',
      content: 'TXT',
    },
    html: {
      bg: 'bg-purple-500',
      content: '<>',
    },

    json: {
      bg: 'bg-orange-500',
      content: '{}',
    },

    notion: {
      bg: 'bg-green-500',
      content: 'N',
    },
  };

  const config = map[type];

  if (!config) return null;

  return (
    <button
      onClick={onClick}
      className={`${base} ${config.bg}`}
      title={type.toUpperCase()}
    >
      {typeof config.content === 'string' ? (
        <span className="text-[10px]">{config.content}</span>
      ) : (
        config.content
      )}
    </button>
  );
}
