# Monaco Editor Extensions System

This directory contains the Monaco Editor extensions and enhancements system for the pair interviewer application.

## Overview

Since VS Code extensions cannot be directly loaded into Monaco Editor due to architectural differences, we've implemented a custom system that provides similar functionality through Monaco Editor's built-in extensibility features.

## Files

### `monaco-extensions.ts`

Configuration file that defines:

- **Language Features**: Enhanced support for TypeScript, JavaScript, and Markdown
- **External Libraries**: Type definitions for React, React DOM, and Node.js
- **Helper Functions**: Utilities to manage and query extensions

### `monaco-loader.ts`

Extension loader that:

- Loads external type definition libraries from CDN
- Configures language-specific features and IntelliSense
- Sets up custom themes and editor configurations
- Provides dynamic editor options based on file language

### `MarkdownPreview.tsx`

A simple markdown preview component that demonstrates enhanced markdown capabilities.

## Adding New Extensions

### 1. Adding Language Features

To add a new language feature, edit `monaco-extensions.ts`:

```typescript
export const MONACO_FEATURES: MonacoLanguageFeature[] = [
  // ... existing features
  {
    id: 'python-enhanced',
    name: 'Python Enhanced',
    description: 'Enhanced Python support with better IntelliSense',
    enabled: true,
    type: 'language',
    config: {
      suggest: {
        includeKeywords: true,
        includeSnippets: true
      }
    }
  }
];
```

### 2. Adding External Libraries

To add new type definitions or libraries:

```typescript
export const MONACO_LIBRARIES: MonacoLibrary[] = [
  // ... existing libraries
  {
    id: 'lodash-types',
    name: 'Lodash Type Definitions',
    url: 'https://unpkg.com/@types/lodash@4/index.d.ts',
    type: 'typescript',
    enabled: true
  }
];
```

### 3. Configuring Language Features

To configure how a language feature works, update the `configureLanguageFeature` function in `monaco-loader.ts`:

```typescript
case 'python-enhanced':
  // Configure Python-specific settings
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    // Python-specific compiler options
  });
  break;
```

## Current Features

### Enhanced TypeScript Support

- Better IntelliSense with React and Node.js types
- Improved autocomplete and suggestions
- Modern ES2020 target with JSX support

### Enhanced JavaScript Support

- Similar features to TypeScript but for JavaScript files
- React JSX support
- Modern JavaScript features

### Enhanced Markdown Support

- Word wrapping enabled
- Line numbers and folding
- Minimap support
- Custom markdown preview component

### Custom Theme

- Dark theme optimized for coding interviews
- Syntax highlighting for common languages
- VSCode-like appearance

## Usage

The extensions are automatically loaded when the `EmbeddedVSCode` component mounts. The system:

1. Loads external type definition libraries
2. Configures language-specific features
3. Sets up custom themes and configurations
4. Provides dynamic editor options based on the current file language

## Future Enhancements

Potential areas for expansion:

1. **Code Snippets**: Add custom code snippets for common patterns
2. **Language Servers**: Integrate with language servers for advanced features
3. **Custom Themes**: Add more theme options
4. **Formatting**: Add code formatting capabilities
5. **Linting**: Integrate with linters for real-time error checking

## Troubleshooting

### Extensions Not Loading

- Check browser console for error messages
- Verify that external library URLs are accessible
- Ensure the `loadMonacoExtensions` function is called before editor initialization

### Type Definitions Not Working

- Verify that the library URLs are correct and accessible
- Check that the library type matches the expected type
- Ensure the library is enabled in the configuration

### Performance Issues

- Consider lazy loading of type definitions
- Implement caching for external libraries
- Optimize the number of loaded libraries
