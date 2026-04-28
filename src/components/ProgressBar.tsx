import React from 'react'

interface ProgressBarProps {
  percentage: number
  label?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  animated?: boolean
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  showPercentage = true,
  color = 'blue',
  animated = true,
  className = '',
}) => {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100)

  const colorMap = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  }

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">{Math.round(normalizedPercentage)}%</span>
          )}
        </div>
      )}

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            animated ? 'animate-pulse' : ''
          } ${colorMap[color]}`}
          style={{ width: `${normalizedPercentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
