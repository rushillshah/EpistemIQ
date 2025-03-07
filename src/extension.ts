import * as vscode from 'vscode';
import { createAssistantPanel } from './commands/assistantPanel';
import { learnWithEpisteme } from './commands/debugControls';
import {
  understandWithEpisteme,
  quizWithEpisteme,
} from './commands/learnControls';
import { EpistemeCodeActionProvider } from './providers/codeActionsProvider';
import { EpistemeCodeLensProvider } from './providers/codeLensProvider';
import { registerEpistemeContentProvider } from './providers/epistemeContentProvider';
import { initDatabase } from './db/proficiency/db';
import {
  showProficiencyDashboard,
} from './commands/dashboard';
import { ProficiencyViewProvider } from './providers/proficiencyViewProvider';
import { TopicDetailsViewProvider } from './providers/topicDetailsProvider';
import { getProficiency } from './db/proficiency/db';


export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage('EpistemIQ is now active!');

  initDatabase(context); 

  // Register Proficiency Dashboard
  const sidebarProvider = new ProficiencyViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'epistemiq.proficiency',
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.start', () => {
      createAssistantPanel();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.errors', learnWithEpisteme)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'epistemiq.understand',
      understandWithEpisteme
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.quiz', quizWithEpisteme)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'epistemiq.viewProficiency',
      showProficiencyDashboard
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file' },
      new EpistemeCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file' },
      new EpistemeCodeLensProvider()
    )
  );

  const topicDetailsProvider = new TopicDetailsViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('epistemiq.topicDetails', topicDetailsProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.viewTopicDetails', async (topic: string) => {
      console.log(`[EXTENSION] Opening topic details for ${topic}`);
      topicDetailsProvider.setTopic(topic);
  
      const panel = vscode.window.createWebviewPanel(
        'epistemiq.topicDetails',
        `${topic} Details`,
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
  
      const proficiency = await getProficiency(topic);
      console.log(`[EXTENSION] Proficiency for ${topic}:`, proficiency);
      panel.webview.html = topicDetailsProvider.getTopicDetailsHTML(topic, proficiency);
    })
  );

  context.subscriptions.push(registerEpistemeContentProvider());

  console.log('[EXTENSION] ProficiencyViewProvider registered');
}

export function deactivate(): void {}
