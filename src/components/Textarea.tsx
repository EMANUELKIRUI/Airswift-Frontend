import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = ({ ...props }) => {
  return (
    <textarea
      {...props}
      className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-primary ${props.className || ''}`}
    />
  )
}

export default Textarea
