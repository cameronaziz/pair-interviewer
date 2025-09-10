/**
 * Monaco Editor Extension Loader
 * 
 * This utility handles loading and configuring Monaco Editor features,
 * libraries, and enhancements based on the configuration in monaco-extensions.ts
 */

import {
  getEnabledFeatures,
  getEnabledLibraries,
  MonacoLanguageFeature
} from './monaco-extensions';

/**
 * Load all enabled Monaco Editor features and libraries
 */
export const loadMonacoExtensions = async (): Promise<void> => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    console.log('Skipping Monaco extensions loading on server side');
    return;
  }

  console.log('Loading Monaco Editor extensions...');

  try {
    // Dynamically import monaco-editor only in the browser
    const monaco = await import('monaco-editor');

    // Load external libraries for better IntelliSense
    await loadExternalLibraries(monaco);

    // Configure language features
    configureLanguageFeatures(monaco);

    // Set up custom themes and configurations
    setupCustomConfigurations(monaco);

    console.log('Monaco Editor extensions loaded successfully');
  } catch (error) {
    console.error('Error loading Monaco Editor extensions:', error);
  }
};

/**
 * Load external type definition libraries
 */
const loadExternalLibraries = async (monaco: any): Promise<void> => {
  const enabledLibraries = getEnabledLibraries();

  for (const library of enabledLibraries) {
    try {
      console.log(`Loading library: ${library.name}`);

      const response = await fetch(library.url);
      if (!(response as any).ok) {
        throw new Error(`Failed to fetch ${library.name}: ${(response as any).status} ${(response as any).statusText || 'Unknown error'}`);
      }

      const content = await (response as any).text();

      // Add the library to Monaco's TypeScript language service
      if (library.type === 'typescript') {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/@types/${library.id}/index.d.ts`
        );
      }

      console.log(`Successfully loaded library: ${library.name}`);
    } catch (error) {
      console.warn(`Failed to load library ${library.name}:`, error);
    }
  }
};

/**
 * Configure language-specific features
 */
const configureLanguageFeatures = (monaco: any): void => {
  const enabledFeatures = getEnabledFeatures();

  for (const feature of enabledFeatures) {
    try {
      console.log(`Configuring feature: ${feature.name}`);

      switch (feature.type) {
        case 'language':
          configureLanguageFeature(feature, monaco);
          break;
        case 'enhancement':
          configureEnhancement(feature);
          break;
        default:
          console.log(`Feature type ${feature.type} not implemented yet`);
      }
    } catch (error) {
      console.warn(`Failed to configure feature ${feature.name}:`, error);
    }
  }
};

/**
 * Configure language-specific features
 */
const configureLanguageFeature = (feature: MonacoLanguageFeature, monaco: any): void => {
  if (feature.config) {
    switch (feature.id) {
      case 'typescript-enhanced':
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types']
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: false
        });

        if (feature.config.suggest) {
          monaco.languages.typescript.typescriptDefaults.setSuggestOptions(feature.config.suggest);
        }

        if (feature.config.quickSuggestions) {
          monaco.languages.typescript.typescriptDefaults.setQuickSuggestions(feature.config.quickSuggestions);
        }
        break;

      case 'javascript-enhanced':
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types']
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: false
        });

        if (feature.config.suggest) {
          monaco.languages.typescript.javascriptDefaults.setSuggestOptions(feature.config.suggest);
        }

        if (feature.config.quickSuggestions) {
          monaco.languages.typescript.javascriptDefaults.setQuickSuggestions(feature.config.quickSuggestions);
        }
        break;
    }
  }
};

/**
 * Configure editor enhancements
 */
const configureEnhancement = (feature: MonacoLanguageFeature): void => {
  if (feature.id === 'markdown-preview' && feature.config) {
    // Markdown-specific configurations are handled in the editor options
    console.log('Markdown preview enhancement configured');
  }
};

/**
 * Set up custom themes and global configurations
 */
const setupCustomConfigurations = (monaco: any): void => {
  // Configure global editor settings
  monaco.editor.setModelMarkers({}, 'owner', []);

  // Set up custom themes if needed
  monaco.editor.defineTheme('interview-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'class', foreground: '4EC9B0' },
      { token: 'interface', foreground: '4EC9B0' },
      { token: 'enum', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'property', foreground: '9CDCFE' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'delimiter', foreground: 'D4D4D4' }
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorCursor.foreground': '#aeafad',
      'editorWhitespace.foreground': '#e3e4e229',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorLineHighlight.background': '#2a2d2e',
      'editorLineHighlight.border': '#282828',
      'editorBracketMatch.background': '#0e639c50',
      'editorBracketMatch.border': '#888888',
      'editorGutter.background': '#1e1e1e',
      'editorGutter.modifiedBackground': '#0c7d9d',
      'editorGutter.addedBackground': '#587c0c',
      'editorGutter.deletedBackground': '#94151b'
    }
  });

  console.log('Custom Monaco Editor theme and configurations applied');
};

/**
 * Get editor options based on enabled features
 */
export const getEditorOptions = (language?: string): any => {
  // Return basic options for SSR
  if (typeof window === 'undefined') {
    return {
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      contextmenu: true,
      selectOnLineNumbers: true,
      glyphMargin: true,
      folding: true,
      foldingHighlight: true,
      showFoldingControls: 'always',
      matchBrackets: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      readOnly: false,
      theme: 'vs-dark'
    };
  }
  const baseOptions: any = {
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    contextmenu: true,
    selectOnLineNumbers: true,
    glyphMargin: true,
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'always',
    matchBrackets: 'always',
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    readOnly: false,
    theme: 'interview-theme'
  };

  // Apply language-specific configurations
  if (language === 'markdown') {
    const markdownFeature = getEnabledFeatures().find(f => f.id === 'markdown-preview');
    if (markdownFeature && markdownFeature.config) {
      return { ...baseOptions, ...markdownFeature.config };
    }
  }

  return baseOptions;
};
