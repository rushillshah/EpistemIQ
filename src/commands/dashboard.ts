import * as vscode from 'vscode';
import { getAllProficiency, resetProficiency } from '../db/proficiency/db';

export async function showProficiencyDashboard() {
  const panel = vscode.window.createWebviewPanel(
    'proficiencyDashboard',
    'Proficiency Dashboard',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  console.log('panel has been created')

  const proficiencyData = await getAllProficiency();
  console.log('iqeffeioefiwoiefwoiwfoe', proficiencyData);

  panel.webview.html = getDashboardHTML(proficiencyData);
}

function getDashboardHTML(proficiencyData: Proficiency[]): string {
  const rows = proficiencyData
    .map(
      (entry) => `
      <tr>
        <td>${entry.topic}</td>
        <td>${entry.accuracy.toFixed(2)}%</td>
        <td>${entry.total_questions}</td>
        <td>${entry.average_time.toFixed(2)} ms</td>
      </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proficiency Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #007acc; color: white; }
        .reset-btn { margin-top: 10px; padding: 8px 12px; background: red; color: white; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <h2>Proficiency Dashboard</h2>
      <table>
        <tr>
          <th>Topic</th>
          <th>Accuracy</th>
          <th>Total Questions</th>
          <th>Average Response Time</th>
        </tr>
        ${rows}
      </table>
      <button class="reset-btn" onclick="resetProficiency()">Reset Data</button>

      <script>
        const vscode = acquireVsCodeApi();
        function resetProficiency() {
          vscode.postMessage({ type: 'resetProficiency' });
        }
      </script>
    </body>
    </html>
  `;
}

export function resetProficiencyData(): void {
  resetProficiency();
  vscode.window.showInformationMessage('Proficiency data has been reset.');
}
