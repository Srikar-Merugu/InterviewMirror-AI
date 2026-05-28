import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface FeatureLockProps {
  featureKey: string; // matches keys used in SubscriptionContext canAccessFeature
  fallback?: React.ReactNode; // optional UI to show when locked
  children: React.ReactNode;
}

export const FeatureLock: React.FC<FeatureLockProps> = ({ featureKey, fallback, children }) => {
  const { canAccessFeature } = useSubscription();
  const allowed = canAccessFeature(featureKey);

  if (allowed) {
    return <>{children}</>;
  }

  // Default fallback: a blurred overlay with lock icon and upgrade CTA
  return (
    <div className="relative pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <div className="text-center text-white space-y-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mx-auto text-indigo-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3V5a3 3 0 10-6 0v3c0 1.657 1.343 3 3 3zm0 2a9 9 0 00-9 9h18a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm">Upgrade required to access this feature.</p>
          {fallback}
        </div>
      </div>
      {/* Render children but blurred */}
      <div className="blur-sm opacity-50" aria-hidden="true">
        {children}
      </div>
    </div>
  );
};
