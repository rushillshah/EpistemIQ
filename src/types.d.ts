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
  correctAnswer: string;
  responseTime: number;
}[];

type QuizQuestion = {
  question: string;
  topic: string;
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
  strongTopics: Record<string, string>;
  weakTopics: Record<string, string>;
  suggestionsForImprovement: string[];
  quizSummary: string;
  clarification?: string;
  quizReview: QuizReviewItem[];
};

type QuizReviewItem = {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
};

type PerformanceSummary = {
  totalScore: string;
  strongTopics: Record<string, string>;
  weakTopics: Record<string, string>;
  suggestionsForImprovement: string[];
};

type QuizFollowup = {
  clarification: string;
  quizReview: QuizReviewItem[];
  totalScore: string;
  strongTopics: Record<string, string>;
  weakTopics: Record<string, string>;
  suggestionsForImprovement: string[];
};

type Proficiency = {
  total_questions: number;
  accuracy: number;
  average_time: number;
  topic: string;
  last_tested: string;
};
