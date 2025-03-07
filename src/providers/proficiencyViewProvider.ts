import * as vscode from 'vscode';

import { getAllProficiency } from '../db/proficiency/db';
import { getScoreRingHTML } from '../utils/html/templates/reusableComponents';
import { getVscodeApiScript } from '../utils/html/utils';

export class ProficiencyViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'epistemiq.proficiency';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    webviewView.webview.options = { enableScripts: true };

    try {
      const proficiencyData = await getAllProficiency();

      if (!proficiencyData || proficiencyData.length === 0) {
        webviewView.webview.html = this.getEmptyDashboardHTML();
      } else {
        webviewView.webview.html = this.getDashboardHTML(proficiencyData);
        webviewView.webview.onDidReceiveMessage((message) => {
          if (message.command === 'openTopicDetails') {
            vscode.commands.executeCommand(
              'epistemiq.viewTopicDetails',
              message.topic
            );
          }
        });
      }
    } catch (error) {
      webviewView.webview.html = `<h3>Error Loading Data</h3><p>${(error as Error).message}</p>`;
    }
  }

  private getDashboardHTML(proficiencyData: Proficiency[]): string {
    proficiencyData.sort(
      (a, b) =>
        new Date(b.last_tested).getTime() - new Date(a.last_tested).getTime()
    );

    const headerRow = `
      <div class="proficiency-card header">
        <div class="topic">Field</div>
        <div class=score-ring-wrapper"> 
          <div class="score-ring-container">Proficiency</div>
        </div>
        <div class="last-tested">Last Tested</div>
      </div>
    `;

    const rows = proficiencyData
      .map((entry) => {
        const scoreColorClass = this.getScoreColor(entry.accuracy);
        return `
        <div class="proficiency-card onclick="handleRowClick('${entry.topic}')">
          <div class="topic">${entry.topic}</div>
          <div class="score-ring-container">${getScoreRingHTML(entry.accuracy, scoreColorClass)}</div>
          <div class="last-tested">${entry.last_tested ? new Date(entry.last_tested).toLocaleDateString() : 'Never'}</div>
        </div>`;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proficiency Dashboard</title>
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            background-color: #121212;
            color: #E0E0E0;
            padding: 20px; 
          }
          h2 { 
            text-align: center; 
            color: #FFFFFF; 
          }
          .dashboard-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 600px;
            margin: auto;
          }
          .proficiency-card {
            display: flex;
            align-items: center;
            background: #1E1E1E; /* Dark background */
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease-in-out;
            gap: 24px;
            &:last-child {
              color: lightgray;
            }
          }
          /* Header styles */
          .proficiency-card.header {
            background: transparent; 
            border: none; /* no border */
            box-shadow: none; /* no shadow */
            font-size: 14px;
            font-weight: 500;
            font-family: 'Consolas', sans-serif;
            margin-bottom: 2px; /* reduced bottom margin */
          }
          /* Remove hover effect for header */
          .proficiency-card.header:hover {
            transform: none;
          }
          .proficiency-card:hover {
            transform: scale(1.02);
            cursor: pointer;
          }
          .topic {
            font-size: 14px;
            font-weight: 500;
            flex: 1;
            color: #E0E0E0;
          }
          .score-ring-container { 
            width: 20px; 
            height: 20px;
            margin-right: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .last-tested {
            font-size: 14px;
            margin-left: 20px; 
          }
          .score-container {
            position: relative;
            width: 45px;
            height: 45px;
          }
          .score-ring { width: 100%; height: 100%; }
          .score-ring-bg { fill: none; stroke: #444; stroke-width: 6; }
          .score-ring-progress { fill: none; stroke-width: 6; transition: stroke-dashoffset 0.5s ease-in-out; }
          .score-text {
            font-size: 12px;
            font-weight: bold;
            text-anchor: middle;
            alignment-baseline: middle;
            fill: #E0E0E0;
            transform: translate(50px, 54px);
          }
          .green { stroke: #4CAF50; } /* High proficiency */
          .yellow { stroke: #FFC107; } /* Medium proficiency */
          .red { stroke: #F44336; } /* Low proficiency */
        </style>
      </head>
      <body>
        <h2>Proficiency Dashboard</h2>
        <div class="dashboard-container">
          ${headerRow}
          ${rows}
        </div>
        <script>
          ${getVscodeApiScript()}
          function handleRowClick(topic) {
            vscode.postMessage({ command: 'openTopicDetails', topic });
          }

            document.addEventListener("DOMContentLoaded", () => {
            
            document.querySelectorAll(".proficiency-card").forEach((card) => {
              card.addEventListener("click", function () {
                const topic = this.querySelector(".topic").innerText;
                handleRowClick(topic);
              });
            });
          });

        </script>
      </body>
      </html>
    `;
  }

  private getEmptyDashboardHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proficiency Dashboard</title>
      </head>
      <body>
        <h2>Proficiency Dashboard</h2>
        <p>No data available. Take a quiz to start tracking proficiency!</p>
      </body>
      </html>
    `;
  }

  private getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'yellow';
    return 'red';
  }
}

// TODO: Make it more adaptive. THere will be another table after clicking on each topic. This page will also have other metrics like average time and how preferred it is out of the topic. This will contain all quizzes taken. Click on each quiz and you get individualized, deep feed back with leetcode problems
