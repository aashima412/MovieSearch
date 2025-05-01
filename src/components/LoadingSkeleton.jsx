import React from 'react';

const LoadingSkeleton = ({ darkMode }) => (
  <div className={`rounded-lg shadow-lg overflow-hidden ${
    darkMode ? 'bg-gray-800' : 'bg-white'
  } animate-pulse`}>
    <div className="md:flex">
      <div className="md:w-1/3">
        <div className="w-full h-96 bg-gray-300 dark:bg-gray-700"></div>
      </div>
      <div className="p-6 md:w-2/3">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSkeleton; 