type Option = {
  question(arg0: any, question: any): string;
  options: any;
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
