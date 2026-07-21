export type AccountViewer = {
  authConfigured: boolean;
  authenticated: boolean;
  email: string | null;
  provider: string | null;
};

export type LearningState = {
  savedQuestionIds: string[];
  attemptedQuestionIds: string[];
  perfectQuestionIds: string[];
  correctJudgments: number;
  perfectByTopic: Record<string, number>;
  dailyPerfect: Record<string, number>;
};

export const guestViewer: AccountViewer = {
  authConfigured: false,
  authenticated: false,
  email: null,
  provider: null,
};

export const emptyLearningState: LearningState = {
  savedQuestionIds: [],
  attemptedQuestionIds: [],
  perfectQuestionIds: [],
  correctJudgments: 0,
  perfectByTopic: {},
  dailyPerfect: {},
};
