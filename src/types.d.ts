type Option = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question(arg0: any, question: any): string;
  options: Option[];
  label: string;
  isCorrect: boolean;
};

type FollowupQuestion = {
  question: string;
  options: Option[];
};

type FixSuggestion = {
  fixedCode: string;
  startLine: number;
  endLine: number;
};

type QuizResponses = {
  question: string;
  selectedOption: string;
  correct: boolean;
}[];

type QuizQuestion = {
  question: string;
  options: { label: string; isCorrect: boolean }[];
};

type QuizQuestions = QuizQuestion[];

type WebviewMessage = {
  type: string;
};

type ChoiceMessage = WebviewMessage & {
  choice: string;
};

type FeedbackResponse = {
  totalScore: string;
  strongTopics: string[];
  weakTopics: string[];
  suggestionsForImprovement: string[];
  quizSummary: string;
};
