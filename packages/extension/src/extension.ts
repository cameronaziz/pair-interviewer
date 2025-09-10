import * as vscode from 'vscode';
import { InterviewRecorder } from './recorder';

let recorder: InterviewRecorder | undefined;

export const activate = (context: vscode.ExtensionContext): void => {
  console.log('Pair Interviewer extension activated');

  recorder = new InterviewRecorder(context);

  // Register commands
  const startRecordingCommand = vscode.commands.registerCommand(
    'pair-interviewer.startRecording',
    async () => {
      const sessionId = await vscode.window.showInputBox({
        prompt: 'Enter the interview session ID',
        placeHolder: 'Session ID from the interview link'
      });

      if (sessionId) {
        await recorder?.startRecording(sessionId);
      }
    }
  );

  const stopRecordingCommand = vscode.commands.registerCommand(
    'pair-interviewer.stopRecording',
    async () => {
      await recorder?.stopRecording();
    }
  );

  context.subscriptions.push(startRecordingCommand, stopRecordingCommand);

  // Check if we should auto-start recording based on launch parameters
  checkAutoStart(context);
};

const checkAutoStart = async (context: vscode.ExtensionContext): Promise<void> => {
  // Check if the extension was launched with a session ID
  const config = vscode.workspace.getConfiguration('pairInterviewer');
  const sessionId = config.get<string>('sessionId');

  if (sessionId) {
    // Auto-start recording if session ID is provided
    setTimeout(async () => {
      await recorder?.startRecording(sessionId);
      
      // Clear the session ID after use
      await config.update('sessionId', undefined, vscode.ConfigurationTarget.Workspace);
    }, 2000); // Wait 2 seconds for VS Code to fully load
  }
};

export const deactivate = (): void => {
  recorder?.dispose();
  console.log('Pair Interviewer extension deactivated');
};