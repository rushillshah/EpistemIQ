import * as vscode from 'vscode';

import { TOPIC_CATEGORIES } from '../../constants';

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

  ---------------------
  ${fullFileContent}
  ---------------------

  The diagnostic error is: "${diagnostic.message}".

  **Fix Instructions (STRICT RULES):**
  - Provide a **concise**, **structured** explanation (PLAIN TEXT ONLY).
  - **DO NOT** use Markdown, backticks (\`\`\`), or any special formatting.
  - **DO NOT** include a language identifier (e.g., \`\`\`javascript, \`\`\`ts).
  - **DO NOT** wrap the code fix in any kind of block.
  - Keep the response **under 5 lines**, and strictly in **plaintext**.
  - If the fix is multiline, format it as an **inline explanation**, using indentation instead of line breaks.

  **Example Format (Strictly Follow This):**
  Explanation: [One or two sentences about what went wrong and how to fix it.]
  Fix: [Fixed code snippet (INLINE, NO CODE BLOCK)]
`;

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
  responsesText: string,
  diagnostic?: string
) => `Below are a user's responses to a quiz:
      ---------------------
      ${responsesText}
      ---------------------
      ${
        diagnostic
          ? `Additionally, the quiz was based on the following diagnostic error:
      ---------------------
      ${diagnostic}
      ---------------------`
          : ''
      }
      
      Provide structured feedback in JSON format using the following schema:
      
      {
        "quizSummary": "___", // this should be just 2-3 words on what the quiz topic is 
        "totalScore": "___",
        "strongTopics": {
          "topic_name_1": "why it's strong",
          "topic_name_2": "why it's strong"
        },
        "weakTopics": {
          "topic_name_1": "why it's weak",
          "topic_name_2": "why it's weak"
        },
        "suggestionsForImprovement": ["___", "___", "Recommended problems to solve: __URL__, __URL__"]
        ${diagnostic ? `"explanation": "___"` : ''}
      }
      
      IMPORTANT: When assigning topics in "strongTopics" and "weakTopics", ONLY use topics from this fixed list:
      ${TOPIC_CATEGORIES.join(', ')}
      
      Ensure that your response is valid JSON with no additional text.`;

export const quizFollowupPrompt = (
  responsesText: string,
  selectedCode: string,
  followupInput: string
) => `Below are a user's responses to a quiz regarding a code snippet:
            ---------------------
            ${responsesText}
            ---------------------
            The original code snippet is:
            ---------------------
            ${selectedCode}
            ---------------------
            The user has a follow-up question: "${followupInput}"
            
            Provide structured feedback in JSON format using the following schema:
            
            {
              "quizSummary": "___", // this should be just 2-3 words summarizing the quiz topic
              "totalScore": "___",
              "strongTopics": {
                "topic_name_1": "why it's strong",
                "topic_name_2": "why it's strong"
              },
              "weakTopics": {
                "topic_name_1": "why it's weak",
                "topic_name_2": "why it's weak"
              },
              "suggestionsForImprovement": ["___", "___", "Recommended problems to solve: __URL__, __URL__"],
              "clarification": "___" // Explanation in plain text, using paragraph breaks as shown below.
            }
            
            **Clarification Formatting Instructions:**
            - The clarification must be written in **plain text** with **no markdown formatting** (e.g., no **bold**, _italic_, or \`inline code\`).
            - Use **short, structured paragraphs** with at most **2 sentences per paragraph**.
            - Separate each paragraph with **a blank line** to improve readability. (2 newlines)
            - Provide a clear, educational explanation without unnecessary complexity.
            
            **Example of correct clarification formatting:**
            "React PropTypes are used to define expected data types for component props. They help catch type mismatches early during development.
      
            The 'intl' prop is an object, typically containing internationalization data. Since its structure is not strictly defined in PropTypes, it can store various localization-related properties.
      
            The 'children' prop allows any valid React node, such as elements, text, or fragments. However, it does not accept functions.
      
            Boolean props like 'expanded' and 'isPublic' must strictly be true or false values, ensuring component behavior is predictable."
            
            IMPORTANT: When assigning topics in "strongTopics" and "weakTopics", ONLY use topics from this fixed list:
            ${TOPIC_CATEGORIES.join(', ')}
            
            Ensure that your response is valid JSON with no additional text.`;

export const summarizePrompt = (selectedCode: string) =>
  `Summarize the following code snippet in under 50 words. Be sure to include all key hooks (e.g. useEffect hooks), functions, and any special handlers (like handleLeaveChannel) that are present. Return only the summary in plain text.
      ---------------------
      ${selectedCode}
      ---------------------`;
