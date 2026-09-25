import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface BackendDownProps {
  retryCount: number;
  onRetry: () => void;
}

const BackendDown: React.FC<BackendDownProps> = ({ retryCount, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <WifiOff className="w-8 h-8 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Backend Unavailable
          </h2>
          
          <p className="text-gray-600 mb-6">
            The backend server is currently not running. Your session is preserved and we'll automatically reconnect when the server is back online.
          </p>

          <div className="space-y-3 w-full">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Automatically retrying... (Attempt {retryCount})</span>
            </div>
            
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Now
            </button>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Login
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">What's happening:</p>
            <ul className="text-left space-y-1">
              <li>• Your session is preserved</li>
              <li>• We're automatically retrying every 5 seconds</li>
              <li>• Unlimited retries until backend returns</li>
              <li>• You'll be reconnected automatically when backend returns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendDown;
