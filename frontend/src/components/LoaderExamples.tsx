import { useState } from 'react';
import Loader, { InlineLoader } from './Loader';

/**
 * USAGE EXAMPLES FOR LOADER COMPONENT
 * 
 * The Loader component supports multiple variants and configurations
 * for different use cases in your application.
 */

// Example 1: Full-screen loader with spinner (for main operations)
export function ExampleFullScreenLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div>
      <Loader isLoading={isLoading} text="Processing your will..." />
      <button onClick={handleClick}>Start Transaction</button>
    </div>
  );
}

// Example 2: Inline loader (for form sections)
export function ExampleInlineLoader() {
  const [isLoading, ] = useState(false);

  return (
    <div className="form-section">
      <InlineLoader isLoading={isLoading} variant="dots" size="sm" text="Loading..." />
      {!isLoading && <form>{/* Your form here */}</form>}
    </div>
  );
}

// Example 3: Using with read/write hooks
export function ExampleWithReadFunction() {
  const [isLoading, setIsLoading] = useState(false);

  const readWillData = async () => {
    setIsLoading(true);
    try {
      // Your read operation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Loader 
        isLoading={isLoading} 
        variant="bar" 
        text="Fetching will data..."
      />
      <button onClick={readWillData}>Load Data</button>
    </div>
  );
}

/**
 * LOADER COMPONENT API
 * 
 * Props:
 * - isLoading: boolean - Controls visibility
 * - variant: 'spinner' | 'dots' | 'pulse' | 'bar' - Animation style
 * - size: 'sm' | 'md' | 'lg' - Size of the loader
 * - text: string - Optional text to display below loader
 * - fullScreen: boolean - Use full screen overlay (default: false)
 * - overlay: boolean - Show backdrop overlay (default: true)
 * - backdropColor: string - Tailwind class for backdrop (default: 'bg-black/50')
 * 
 * RECOMMENDED USAGE:
 * 
 * 1. Read Operations (fetching data):
 *    <Loader isLoading={isLoading} variant="dots" text="Loading..."/>
 * 
 * 2. Write Operations (creating/updating):
 *    <Loader isLoading={isLoading} variant="spinner" fullScreen text="Processing..."/>
 * 
 * 3. Inline/Subtle Loading:
 *    <InlineLoader isLoading={isLoading} variant="pulse" size="sm"/>
 * 
 * 4. Progress-like Loading:
 *    <Loader isLoading={isLoading} variant="bar" text="Submitting..."/>
 */


// Full-screen loader (for write operations)
{/* <Loader isLoading={isLoading} text="Processing..." />

// Inline loader (for read operations)
<InlineLoader isLoading={isLoading} variant="dots" size="sm" />

// Custom variant
<Loader 
  isLoading={isLoading} 
  variant="bar" 
  text="Fetching data..."
  fullScreen={false}
/> */}
