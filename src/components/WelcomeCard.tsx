import React from 'react'

interface WelcomeCardProps {
  userName: string
  role?: string
  className?: string
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userName,
  role = 'Job Seeker',
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white ${className}`}>
      <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1>
      <p className="text-blue-100 text-lg">Ready to advance your career? Check your application status and upcoming interviews.</p>
      <p className="text-blue-200 text-sm mt-4">Role: {role}</p>
    </div>
  )
}

export default WelcomeCard
