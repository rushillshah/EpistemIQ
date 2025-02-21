type Option = {
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
  }