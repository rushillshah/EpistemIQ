import * as vscode from 'vscode';

export const initialQuestionPrompt = (diagnostic: vscode.Diagnostic) => {
  return `Given the following diagnostic error: "${diagnostic.message}",
          list three potential causes as a JSON array of objects with "label" and "isCorrect" (true for the correct cause, others false).
          For example: [{"label": "Missing semicolon", "isCorrect": false}, {"label": "Incorrect variable type", "isCorrect": true}, {"label": "Mismatched brackets", "isCorrect": false}].`;
};

export const optionsPrompt = (
  diagnostic: vscode.Diagnostic
) => `Below is an error message:
  ---------------------
  ${diagnostic.message}
  ---------------------
  Based on the code above, generate 5 unique quiz questions that test understanding of the error and related issues/concepts.
  Each question must include multiple-choice answers.
  Return the questions as a JSON array in the following format:
  [
    {
      "question": "Question text",
      "options": [
        {"label": "Option 1", "isCorrect": false},
        {"label": "Option 2", "isCorrect": true},
        {"label": "Option 3", "isCorrect": false},
        {"label": "Option 4", "isCorrect": false}
      ]
    },
    ...
`;

export const fixPrompt = (
  diagnostic: vscode.Diagnostic,
  fullFileContent: string
) => `Given the following code snippet:
  ${fullFileContent}
  and the diagnostic error: "${diagnostic.message}",
  provide the corrected explanation for the entire block that needs fixing. A maximum of 5 lines of response, with a small code snippet on the fix. In those 5 lines, respond with the user's quiz results in mind, gauging their understanding`;

export const initialSnippetPrompt = (
  selectedCode: string,
  userInput: string
) => `Below is a code snippet:
  ---------------------
  ${selectedCode}
  ---------------------
  The user is specifically confused about: "${userInput}"
  Please provide a concise, tailored explanation that addresses only this concern. Focus on the parts of the code relevant to "${userInput}" and avoid generic descriptions. Return only plain text.`;

export const followupSnippetPrompt = (
  followupInput: string,
  codeSummary: string,
  previousContext: string
) => `Below is a brief summary of the original code:
  ---------------------
  ${codeSummary}
  ---------------------
  The previous explanation was:
  ---------------------
  ${previousContext}
  ---------------------
  Now, the user asks a follow-up: "${followupInput}"
  Please provide further clarification and insights, building on the above summary.
  Return only plain text.`;

export const quizPrompt = (
  selectedCode: string,
  focus: string
) => `Below is a code snippet:
  ---------------------
  ${selectedCode}
  ---------------------
  Based on the code above, generate 5 to 7 unique quiz questions that test understanding of the code snippet.
  Each question must include multiple-choice answers.
  If the focus parameter ("${focus}") is a clear, valid, and relevant topic (e.g. "performance", "error handling", "security", "code structure", etc.), incorporate it into the questions.
  If the focus appears to be gibberish or unrelated to the code (for example, if it contains random characters or words that don't match a programming context), ignore it and generate questions based solely on the code.
  Return the questions as a JSON array in the following format:
  [
    {
      "question": "Question text",
      "options": [
        {"label": "Option 1", "isCorrect": false},
        {"label": "Option 2", "isCorrect": true},
        {"label": "Option 3", "isCorrect": false},
        {"label": "Option 4", "isCorrect": false}
      ]
    },
    ...
  ]
  `;

export const feedbackPrompt = (
  responsesText: string
) => `Below are a user's responses to a quiz:
  ---------------------
  ${responsesText}
  ---------------------
  Provide structured feedback in JSON format using the following schema:
  
  {
    "quizSummary": "___", // 3 words summarizing the topics covered in the quiz
    "totalScore": "___", // Total score, like "8/10"
    "strongTopics": ["___", "___"], // List of strong topics
    "weakTopics": ["___", "___"], // List of weak topics
    "suggestionsForImprovement": ["___", "___"] // List of improvement suggestions
  }
  
  Ensure that your response is valid JSON with no additional text.`;

export const quizFollowupPrompt = (
  responsesText: string,
  selectedCode: string,
  followupInput: string
) =>
  `Below is a summary of a student's quiz responses regarding a code snippet:
    ---------------------
    ${responsesText}
    ---------------------
    The original code snippet is:
    ---------------------
    ${selectedCode}
    ---------------------
    The user has a follow-up question: "${followupInput}"

    Please provide additional tailored clarification and insights.
    Return ONLY a valid JSON object with the following structure:
    {
      "clarification": "___",
      "quizReview": [
        {
          "question": "___",
          "userAnswer": "___",
          "isCorrect": true/false,
          "correctAnswer": "___"
        }
      ],
      "performanceSummary": {
        "totalScore": "X/Y",
        "strongTopics": ["___", "___"],
        "weakTopics": ["___", "___"],
        "suggestionsForImprovement": ["___", "___"]
      }
    }`;

export const summarizePrompt = (selectedCode: string) =>
  `Summarize the following code snippet in under 50 words. Be sure to include all key hooks (e.g. useEffect hooks), functions, and any special handlers (like handleLeaveChannel) that are present. Return only the summary in plain text.
      ---------------------
      ${selectedCode}
      ---------------------`;
