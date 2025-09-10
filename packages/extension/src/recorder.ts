import * as vscode from 'vscode';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { RecordingEvent, RecordingChunk, RecordingState, VSCodeEvent } from './types';

export class InterviewRecorder {
  private state: RecordingState = {
    isRecording: false,
    sessionId: null,
    events: [],
    chunkIndex: 0,
    lastChunkTime: Date.now()
  };

  private readonly CHUNK_TIME_INTERVAL = 15000; // 15 seconds
  private readonly CHUNK_EVENT_LIMIT = 500;
  private readonly MAX_RECORDING_TIME = 30 * 60 * 1000; // 30 minutes
  
  private chunkTimer?: NodeJS.Timeout;
  private disposables: vscode.Disposable[] = [];
  private recordingStartTime = 0;
  private webviewPanel?: vscode.WebviewPanel;

  constructor(private context: vscode.ExtensionContext) {}

  public async startRecording(sessionId: string): Promise<void> {
    if (this.state.isRecording) {
      vscode.window.showWarningMessage('Recording is already in progress');
      return;
    }

    this.state = {
      isRecording: true,
      sessionId,
      events: [],
      chunkIndex: 0,
      lastChunkTime: Date.now()
    };

    this.recordingStartTime = Date.now();
    this.setupEventListeners();
    this.startChunkTimer();
    this.createRecordingWebview();

    vscode.window.showInformationMessage('Interview recording started');
  }

  public async stopRecording(): Promise<void> {
    if (!this.state.isRecording) {
      vscode.window.showWarningMessage('No recording in progress');
      return;
    }

    // Send final chunk
    if (this.state.events.length > 0) {
      await this.sendChunk();
    }

    // Cleanup
    this.state.isRecording = false;
    this.clearChunkTimer();
    this.disposeEventListeners();
    this.webviewPanel?.dispose();

    // Notify server that recording ended
    await this.notifyRecordingEnd();

    vscode.window.showInformationMessage('Interview recording stopped');
  }

  private setupEventListeners(): void {
    // File open events
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        this.recordVSCodeEvent({
          type: 'fileOpen',
          timestamp: Date.now(),
          data: {
            fileName: document.fileName,
            filePath: document.uri.fsPath
          }
        });
      })
    );

    // Text edit events
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.contentChanges.length > 0) {
          const change = event.contentChanges[0];
          this.recordVSCodeEvent({
            type: 'textEdit',
            timestamp: Date.now(),
            data: {
              fileName: event.document.fileName,
              filePath: event.document.uri.fsPath,
              text: change.text,
              line: change.range.start.line,
              character: change.range.start.character
            }
          });
        }
      })
    );

    // File save events
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        this.recordVSCodeEvent({
          type: 'fileSave',
          timestamp: Date.now(),
          data: {
            fileName: document.fileName,
            filePath: document.uri.fsPath
          }
        });
      })
    );

    // Tab change events
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.recordVSCodeEvent({
            type: 'tabChange',
            timestamp: Date.now(),
            data: {
              fileName: editor.document.fileName,
              filePath: editor.document.uri.fsPath
            }
          });
        }
      })
    );
  }

  private recordVSCodeEvent(event: VSCodeEvent): void {
    if (!this.state.isRecording) return;

    // Check max recording time
    if (Date.now() - this.recordingStartTime > this.MAX_RECORDING_TIME) {
      this.stopRecording();
      vscode.window.showWarningMessage('Maximum recording time (30 minutes) reached. Recording stopped.');
      return;
    }

    // Convert VSCode event to recording event format
    const recordingEvent: RecordingEvent = {
      type: this.getEventType(event.type),
      data: event.data,
      timestamp: event.timestamp
    };

    this.state.events.push(recordingEvent);

    // Check if we need to send chunk based on event count
    if (this.state.events.length >= this.CHUNK_EVENT_LIMIT) {
      this.sendChunk();
    }
  }

  private getEventType(vsCodeEventType: VSCodeEvent['type']): number {
    // Map VSCode events to rrweb-compatible event types
    const typeMap: Record<VSCodeEvent['type'], number> = {
      'fileOpen': 100,
      'fileEdit': 101,
      'fileSave': 102,
      'tabChange': 103,
      'textEdit': 104
    };
    return typeMap[vsCodeEventType] || 999;
  }

  private startChunkTimer(): void {
    this.chunkTimer = setInterval(() => {
      if (this.state.events.length > 0) {
        this.sendChunk();
      }
    }, this.CHUNK_TIME_INTERVAL);
  }

  private clearChunkTimer(): void {
    if (this.chunkTimer) {
      clearInterval(this.chunkTimer);
      this.chunkTimer = undefined;
    }
  }

  private async sendChunk(): Promise<void> {
    if (!this.state.sessionId || this.state.events.length === 0) return;

    const chunk: RecordingChunk = {
      sessionId: this.state.sessionId,
      events: [...this.state.events],
      chunkIndex: this.state.chunkIndex,
      timestamp: Date.now()
    };

    try {
      const config = vscode.workspace.getConfiguration('pairInterviewer');
      const serverUrl = config.get<string>('serverUrl', 'http://localhost:3001');
      
      await axios.post(`${serverUrl}/api/recording/chunk`, chunk, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      // Clear events and increment chunk index
      this.state.events = [];
      this.state.chunkIndex++;
      this.state.lastChunkTime = Date.now();

      console.log(`Sent chunk ${chunk.chunkIndex} with ${chunk.events.length} events`);
    } catch (error) {
      console.error('Failed to send recording chunk:', error);
      vscode.window.showErrorMessage('Failed to upload recording data');
    }
  }

  private async notifyRecordingEnd(): Promise<void> {
    if (!this.state.sessionId) return;

    try {
      const config = vscode.workspace.getConfiguration('pairInterviewer');
      const serverUrl = config.get<string>('serverUrl', 'http://localhost:3001');
      
      await axios.post(`${serverUrl}/api/recording/end`, {
        sessionId: this.state.sessionId,
        endTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to notify recording end:', error);
    }
  }

  private createRecordingWebview(): void {
    this.webviewPanel = vscode.window.createWebviewPanel(
      'pairInterviewerRecording',
      'Interview Recording',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.webviewPanel.webview.html = this.getWebviewContent();

    this.webviewPanel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'stopRecording':
            await this.stopRecording();
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );

    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });
  }

  private getWebviewContent(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Recording</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
            }
            .recording-indicator {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            .red-dot {
                width: 12px;
                height: 12px;
                background-color: #ff4444;
                border-radius: 50%;
                animation: blink 1s infinite;
            }
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }
            .stop-button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 10px 20px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 14px;
            }
            .stop-button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .info {
                margin-top: 20px;
                padding: 10px;
                background-color: var(--vscode-textBlockQuote-background);
                border-left: 3px solid var(--vscode-textBlockQuote-border);
            }
        </style>
    </head>
    <body>
        <div class="recording-indicator">
            <div class="red-dot"></div>
            <h2>Recording Interview</h2>
        </div>
        
        <p>Your interview session is being recorded. All code changes, file operations, and editor interactions are being captured.</p>
        
        <button class="stop-button" onclick="stopRecording()">Stop Recording</button>
        
        <div class="info">
            <p><strong>What's being recorded:</strong></p>
            <ul>
                <li>File opens and saves</li>
                <li>Code changes and edits</li>
                <li>Tab switches</li>
                <li>Cursor movements</li>
            </ul>
            <p><strong>Note:</strong> Recording will automatically stop after 30 minutes for free tier users.</p>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            function stopRecording() {
                vscode.postMessage({
                    command: 'stopRecording'
                });
            }
        </script>
    </body>
    </html>`;
  }

  private disposeEventListeners(): void {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
  }

  public dispose(): void {
    this.stopRecording();
    this.disposeEventListeners();
  }
}