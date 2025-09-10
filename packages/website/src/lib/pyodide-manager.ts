import { FileData } from '@/types';

export interface PythonExecutionResult {
  output: string;
  error: string | null;
  returnValue: any;
  executionTime: number;
}

export interface PythonExecutionOptions {
  timeout?: number;
  packages?: string[];
}

export class PyodideManager {
  private pyodide: any = null;
  private isInitialized = false;
  private isInitializing = false;
  private virtualFileSystem: Map<string, string> = new Map();
  private executionHistory: PythonExecutionResult[] = [];

  constructor() {
    this.initializePyodide();
  }

  private async initializePyodide(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      // Load Pyodide from global script
      const loadPyodide = (window as any).loadPyodide;

      if (!loadPyodide) {
        throw new Error('Pyodide not loaded. Make sure the script is included in the HTML.');
      }

      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        stdout: (text: string) => {
          // Capture stdout for output
          this.currentOutput += text;
        },
        stderr: (text: string) => {
          // Capture stderr for errors
          this.currentError += text;
        }
      });

      // Set up the virtual file system
      this.setupVirtualFileSystem();

      this.isInitialized = true;
      this.isInitializing = false;

      console.log('Pyodide initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  private currentOutput = '';
  private currentError = '';

  private setupVirtualFileSystem(): void {
    if (!this.pyodide) return;

    // Create project directory
    this.pyodide.FS.mkdir('/project');
    this.pyodide.FS.chdir('/project');
  }

  public async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      await this.initializePyodide();
    }
  }

  public async syncFiles(files: FileData[]): Promise<void> {
    await this.waitForInitialization();

    if (!this.pyodide) return;

    // Clear existing files
    this.virtualFileSystem.clear();

    // Add all Python files to virtual file system
    for (const file of files) {
      if (file.language === 'python' && file.content) {
        const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
        this.virtualFileSystem.set(filePath, file.content);

        // Write to Pyodide's file system
        try {
          this.pyodide.FS.writeFile(`/project${filePath}`, file.content);
        } catch (error) {
          console.warn(`Failed to write file ${filePath}:`, error);
        }
      }
    }
  }

  public async createFile(filePath: string, content: string): Promise<void> {
    await this.waitForInitialization();

    if (!this.pyodide) return;

    const fullPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    this.virtualFileSystem.set(fullPath, content);

    try {
      this.pyodide.FS.writeFile(`/project${fullPath}`, content);
    } catch (error) {
      console.warn(`Failed to create file ${filePath}:`, error);
    }
  }

  public async updateFile(filePath: string, content: string): Promise<void> {
    await this.waitForInitialization();

    if (!this.pyodide) return;

    const fullPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    this.virtualFileSystem.set(fullPath, content);

    try {
      this.pyodide.FS.writeFile(`/project${fullPath}`, content);
    } catch (error) {
      console.warn(`Failed to update file ${filePath}:`, error);
    }
  }

  public async installPackage(packageName: string): Promise<void> {
    await this.waitForInitialization();

    if (!this.pyodide) return;

    try {
      await this.pyodide.loadPackage(packageName);
      console.log(`Package ${packageName} installed successfully`);
    } catch (error) {
      console.warn(`Failed to install package ${packageName}:`, error);
      throw error;
    }
  }

  public async executePython(
    code: string,
    options: PythonExecutionOptions = {}
  ): Promise<PythonExecutionResult> {
    await this.waitForInitialization();

    if (!this.pyodide) {
      throw new Error('Pyodide not initialized');
    }

    const startTime = Date.now();
    this.currentOutput = '';
    this.currentError = '';

    const timeout = options.timeout || 30000; // 30 seconds default

    try {
      // Install packages if specified
      if (options.packages && options.packages.length > 0) {
        for (const pkg of options.packages) {
          try {
            await this.installPackage(pkg);
          } catch (error) {
            console.warn(`Failed to install package ${pkg}:`, error);
          }
        }
      }

      // Execute Python code with timeout
      const result = await Promise.race([
        this.pyodide.runPython(code),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        )
      ]);

      const executionTime = Date.now() - startTime;
      const executionResult: PythonExecutionResult = {
        output: this.currentOutput,
        error: this.currentError || null,
        returnValue: result,
        executionTime
      };

      this.executionHistory.push(executionResult);
      return executionResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const executionResult: PythonExecutionResult = {
        output: this.currentOutput,
        error: this.currentError || errorMessage,
        returnValue: null,
        executionTime
      };

      this.executionHistory.push(executionResult);
      return executionResult;
    }
  }

  public async executeFile(
    filePath: string,
    options: PythonExecutionOptions = {}
  ): Promise<PythonExecutionResult> {
    await this.waitForInitialization();

    if (!this.pyodide) {
      throw new Error('Pyodide not initialized');
    }

    const fullPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const content = this.virtualFileSystem.get(fullPath);

    if (!content) {
      throw new Error(`File ${filePath} not found in virtual file system`);
    }

    // Change to project directory and execute
    const originalCwd = this.pyodide.FS.cwd();
    this.pyodide.FS.chdir('/project');

    try {
      const result = await this.executePython(content, options);
      return result;
    } finally {
      this.pyodide.FS.chdir(originalCwd);
    }
  }

  public getExecutionHistory(): PythonExecutionResult[] {
    return [...this.executionHistory];
  }

  public clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  public getAvailableFiles(): string[] {
    return Array.from(this.virtualFileSystem.keys());
  }

  public isReady(): boolean {
    return this.isInitialized && !this.isInitializing;
  }
}

// Singleton instance
export const pyodideManager = new PyodideManager();