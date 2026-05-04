import React from 'react';
import Button from './Button';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
}

interface JobCardProps {
  job: Job;
  onApply: (jobId: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
      <p className="text-gray-600 mb-2">📍 {job.location}</p>
      <p className="text-gray-700 mb-4">{job.description}</p>
      <Button onClick={() => onApply(job.id)}>Apply</Button>
    </div>
  );
};

export default JobCard;