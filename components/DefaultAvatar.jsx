import React from 'react';

const DefaultAvatar = ({ name = '', size = 96, className = '' }) => {
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'K';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'K';
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div 
      className={`rounded-full flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: '#FF6B00',
        fontSize: `${size * 0.4}px`,
        lineHeight: 1
      }}
    >
      <span className="text-white font-bold select-none">
        {initials}
      </span>
    </div>
  );
};

export default DefaultAvatar; 
 