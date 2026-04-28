import React from 'react'
import { Calendar, Clock, MapPin, Video, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Interview {
  _id: string
  jobTitle: string
  company: string
  date: string
  time?: string
  type: 'phone' | 'video' | 'in-person'
  link?: string
  location?: string
}

interface UpcomingInterviewsProps {
  interviews: Interview[]
  className?: string
}

const UpcomingInterviews: React.FC<UpcomingInterviewsProps> = ({
  interviews = [],
  className = '',
}) => {
  const getInterviewIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />
      case 'phone':
        return <Phone className="w-5 h-5 text-green-600" />
      case 'in-person':
        return <MapPin className="w-5 h-5 text-purple-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (time?: string) => {
    if (!time) return ''
    return time
  }

  const upcomingInterviews = interviews
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          Upcoming Interviews
        </h2>
        {interviews.length > 0 && (
          <Link href="/job-seeker/interviews">
            <a className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </a>
          </Link>
        )}
      </div>

      {upcomingInterviews.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No upcoming interviews scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingInterviews.map(interview => (
            <div
              key={interview._id}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{interview.jobTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">{interview.company}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-green-600" />
                      {formatDate(interview.date)}
                    </div>
                    {interview.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {formatTime(interview.time)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {getInterviewIcon(interview.type)}
                      <span className="capitalize">{interview.type}</span>
                    </div>
                  </div>

                  {interview.location && interview.type === 'in-person' && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {interview.location}
                    </div>
                  )}
                </div>

                {interview.link && interview.type === 'video' && (
                  <a
                    href={interview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    Join Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Phone icon since lucide-react might not have it
const Phone = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l2.498 8.995a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l8.995 2.498a1 1 0 00.684-.949V5a2 2 0 00-2-2h-1C9.716 3 3 9.716 3 17v-2z"
    />
  </svg>
)

export default UpcomingInterviews
