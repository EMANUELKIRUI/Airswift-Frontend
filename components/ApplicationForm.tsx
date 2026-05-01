'use client';

import React, { useState } from 'react';

interface ApplicationFormProps {
  jobId: string;
  onSubmit: (payload: { jobId: string; coverLetter: string; resume: string }) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ jobId, onSubmit }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ jobId, coverLetter, resume });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="coverLetter">Cover Letter</label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={6}
          required
        />
      </div>
      <div>
        <label htmlFor="resume">Resume URL or File Link</label>
        <input
          id="resume"
          type="text"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          required
        />
      </div>
      <button type="submit">Submit Application</button>
    </form>
  );
};