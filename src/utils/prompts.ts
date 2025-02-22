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
  Based on the code above, generate 5 to 7 unique quiz questions that test understanding.
  Each question must include multiple-choice answers.
  Focus on ${focus}.
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
) => `Below are a student's responses to a quiz:
      ---------------------
      ${responsesText}
      ---------------------
      Please provide a detailed analysis of the student's understanding of the code.
      Highlight key areas where the student is struggling and suggest improvements.
      Return your feedback in plain text, keep it short and target concrete points instead of waxing on in explanation. At the end, provide a summary, and a line or two about what they should work on next, with directions to articles and documentation relevant to that area`;
