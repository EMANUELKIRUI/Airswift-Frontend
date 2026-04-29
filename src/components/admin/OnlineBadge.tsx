interface OnlineBadgeProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function OnlineBadge({
  isOnline,
  size = 'md',
  showText = false,
  className = ''
}: OnlineBadgeProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <span
        className={`rounded-full ${sizeClasses[size]} ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {showText && (
        <span className={`ml-2 text-sm ${
          isOnline ? 'text-green-600' : 'text-gray-500'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}