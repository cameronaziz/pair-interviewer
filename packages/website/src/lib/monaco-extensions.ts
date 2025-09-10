/**
 * Monaco Editor Extensions Configuration
 * 
 * This file manages the list of language features and enhancements
 * that should be automatically loaded in the Monaco Editor instance.
 * 
 * Note: VS Code extensions cannot be directly loaded into Monaco Editor
 * due to architectural differences. Instead, we configure Monaco Editor's
 * built-in language features and add custom enhancements.
 */

export interface MonacoLanguageFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'language' | 'theme' | 'snippet' | 'library' | 'enhancement';
  config?: any;
}

export interface MonacoLibrary {
  id: string;
  name: string;
  url: string;
  type: 'typescript' | 'javascript' | 'css' | 'html';
  enabled: boolean;
}

/**
 * List of language features and enhancements for Monaco Editor
 * Add new features here to enhance the editor capabilities
 */
export const MONACO_FEATURES: MonacoLanguageFeature[] = [
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Enhanced markdown editing with preview capabilities',
    enabled: true,
    type: 'enhancement',
    config: {
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      minimap: { enabled: true }
    }
  },
  {
    id: 'typescript-enhanced',
    name: 'TypeScript Enhanced',
    description: 'Enhanced TypeScript support with better IntelliSense',
    enabled: true,
    type: 'language',
    config: {
      suggest: {
        includeKeywords: true,
        includeSnippets: true
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      }
    }
  },
  {
    id: 'javascript-enhanced',
    name: 'JavaScript Enhanced',
    description: 'Enhanced JavaScript support with modern features',
    enabled: true,
    type: 'language',
    config: {
      suggest: {
        includeKeywords: true,
        includeSnippets: true
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      }
    }
  }
];

/**
 * List of external libraries to load for better IntelliSense
 */
export const MONACO_LIBRARIES: MonacoLibrary[] = [
  {
    id: 'react-types',
    name: 'React Type Definitions',
    url: 'https://unpkg.com/@types/react@18/index.d.ts',
    type: 'typescript',
    enabled: true
  },
  {
    id: 'react-dom-types',
    name: 'React DOM Type Definitions',
    url: 'https://unpkg.com/@types/react-dom@18/index.d.ts',
    type: 'typescript',
    enabled: true
  },
  {
    id: 'node-types',
    name: 'Node.js Type Definitions',
    url: 'https://unpkg.com/@types/node@20/index.d.ts',
    type: 'typescript',
    enabled: true
  }
];

/**
 * Get all enabled features
 */
export const getEnabledFeatures = (): MonacoLanguageFeature[] => {
  return MONACO_FEATURES.filter(feature => feature.enabled);
};

/**
 * Get all enabled libraries
 */
export const getEnabledLibraries = (): MonacoLibrary[] => {
  return MONACO_LIBRARIES.filter(lib => lib.enabled);
};

/**
 * Get feature by ID
 */
export const getFeatureById = (id: string): MonacoLanguageFeature | undefined => {
  return MONACO_FEATURES.find(feature => feature.id === id);
};

/**
 * Get library by ID
 */
export const getLibraryById = (id: string): MonacoLibrary | undefined => {
  return MONACO_LIBRARIES.find(lib => lib.id === id);
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (id: string): boolean => {
  const feature = getFeatureById(id);
  return feature ? feature.enabled : false;
};

/**
 * Check if a library is enabled
 */
export const isLibraryEnabled = (id: string): boolean => {
  const library = getLibraryById(id);
  return library ? library.enabled : false;
};
