import React, { createContext, useContext } from 'react';

export const theme = {
  text: 'text-white',
  textSecondary: 'text-gray-300',
  input: 'bg-gray-700/30',
  hover: 'hover:bg-gray-700/40',
  button: 'bg-gray-700/30 hover:bg-gray-700/40',
  icon: 'text-gray-300',
  weatherIcons: {
    cloud: 'text-gray-300',
    rain: 'text-blue-400',
    wind: 'text-gray-300',
    sun: 'text-yellow-400',
    humidity: 'text-blue-400'
  }
};

const ThemeContext = createContext(theme);

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 