import React from 'react';

export interface LoaderProps {
  isLoading: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bar';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  backdropColor?: string;
}

export default function Loader({
  isLoading,
  variant = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  overlay = true,
  backdropColor = 'bg-black/50',
}: LoaderProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerContent = (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className={`absolute inset-0 rounded-full border-4 border-gray-200`} />
      <div
        className={`absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin`}
      />
    </div>
  );

  const dotsContent = (
    <div className="flex gap-2 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full bg-primary ${
            size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
          } animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  const pulseContent = (
    <div className={`${sizeClasses[size]} rounded-full bg-primary animate-pulse`} />
  );

  const barContent = (
    <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-primary animate-pulse w-full" />
    </div>
  );

  const contentMap = {
    spinner: spinnerContent,
    dots: dotsContent,
    pulse: pulseContent,
    bar: barContent,
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {contentMap[variant]}
      {text && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          overlay ? backdropColor : ''
        } z-50 transition-opacity duration-300`}
      >
        <div className="bg-white rounded-lg shadow-xl p-8">
          {loaderContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        overlay
          ? `fixed inset-0 flex items-center justify-center ${backdropColor} z-50`
          : 'flex items-center justify-center py-8'
      }`}
    >
      {overlay ? (
        <div className="bg-white rounded-lg shadow-xl p-8">{loaderContent}</div>
      ) : (
        loaderContent
      )}
    </div>
  );
}

// Inline Loader - use this for inline loading states without full overlay
export function InlineLoader({
  isLoading,
  variant = 'spinner',
  size = 'sm',
  text,
}: Omit<LoaderProps, 'fullScreen' | 'overlay' | 'backdropColor'>) {
  if (!isLoading) return null;

  return (
    <Loader
      isLoading={isLoading}
      variant={variant}
      size={size}
      text={text}
      fullScreen={false}
      overlay={false}
    />
  );
}
