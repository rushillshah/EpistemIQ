import * as vscode from 'vscode';
import { getProficiency } from '../db/proficiency/db';

export class TopicDetailsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'epistemiq.topicDetails';
  private topic: string = '';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public setTopic(topic: string) {
    this.topic = topic;
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    webviewView.webview.options = { enableScripts: true };
    const proficiency = await getProficiency(this.topic);
    webviewView.webview.html = this.getTopicDetailsHTML(
      this.topic,
      proficiency
    );
  }

  public getTopicDetailsHTML(topic: string, proficiency: Proficiency): string {
    const avgAccuracy = proficiency?.accuracy
      ? `${proficiency.accuracy.toFixed(2)}%`
      : 'N/A';
    const totalQuizzes = proficiency?.total_questions ?? 'N/A';
    const avgTime = proficiency?.average_time
      ? `${proficiency.average_time.toFixed(2)}s`
      : 'N/A';
    const lastQuiz = proficiency?.last_tested
      ? new Date(proficiency.last_tested).toLocaleDateString()
      : 'N/A';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${topic} Details</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #121212; color: #E0E0E0; padding: 20px; }
          h2 { text-align: center; color: #FFFFFF; }
          .stats-container { display: flex; justify-content: space-between; margin-top: 20px; }
          .stat-box { background: #1E1E1E; padding: 10px; border-radius: 10px; width: 22%; text-align: center; }
          canvas { background: #1E1E1E; border-radius: 10px; margin-top: 20px; padding: 10px; }
        </style>
      </head>
      <body>
        <h2>${topic} Performance</h2>
        <div class="stats-container">
          <div class="stat-box"><strong>Avg Accuracy</strong><br>${avgAccuracy}</div>
          <div class="stat-box"><strong>Total Quizzes</strong><br>${totalQuizzes}</div>
          <div class="stat-box"><strong>Avg Time per Question</strong><br>${avgTime}</div>
          <div class="stat-box"><strong>Last Quiz</strong><br>${lastQuiz}</div>
        </div>
        <canvas id="performanceChart"></canvas>
        <script>
          const ctx = document.getElementById('performanceChart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
              datasets: [{
                label: 'Accuracy (%)',
                data: [70, 85, 60, 90, 80], // Placeholder until real quiz history is available
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
              }]
            },
            options: { scales: { y: { beginAtZero: true, max: 100 } } }
          });
        </script>
      </body>
      </html>
    `;
  }
}
