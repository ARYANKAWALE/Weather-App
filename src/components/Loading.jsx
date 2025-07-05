import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Loading = () => {
  const theme = useTheme();

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme.text}`}></div>
    </div>
  );
};

export default Loading; 