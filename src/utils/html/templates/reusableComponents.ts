import { htmlDocument, getVscodeApiScript } from '../utils';

export function getScoreRingHTML(
  percentage: number,
  scoreColorClass: string
): string {
  return `
    <div class="score-container">
      <svg class="score-ring" viewBox="0 0 100 100">
        <circle class="score-ring-bg" cx="50" cy="50" r="45"></circle>        
        <circle class="score-ring-progress ${scoreColorClass}" cx="50" cy="50" r="45"
                style="stroke-dasharray: 283; stroke-dashoffset: ${283 - (percentage / 100) * 283};
                       transform: rotate(-90deg); transform-origin: 50% 50%;">
        </circle>
        <text x="50" y="50" class="score-text">${percentage.toFixed(1)}%</text>
      </svg>
    </div>
  `;
}

export function getFollowupSection(followupType: string): string {
  return `
      <div class="fixed-input-container">
        <div class="input-wrapper">
          <textarea id="followupInput" placeholder="Type your follow-up question..."></textarea>
          <button onclick="submitFollowup()" class="send-button">➤</button>
        </div>
      </div>
  
      <script>
        ${getVscodeApiScript()}
  
        function submitFollowup() {
          const input = document.getElementById("followupInput").value.trim();
          if (!input) return;
          vscode.postMessage({ type: '${followupType}', input: input });
          document.getElementById("followupInput").value = ""; 
        }
  
        document.getElementById("followupInput").addEventListener("keypress", function(event) {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitFollowup();
          }
        });
      </script>
    `;
}

export function getLoadingStateHTML(message: string): string {
  const bodyContent = `
      <div class="loading-container">
        <p class="loading-text">${message}<span class="loading-dots"></span></p>
        <div class="spinner"></div>
      </div>
    `;
  return htmlDocument(bodyContent, false);
}
