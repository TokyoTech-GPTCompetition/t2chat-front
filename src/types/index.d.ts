/**
 *@description information of Lecture
 */
export interface Lecture {
  name: string;
  abstract: string;
  url: string;
  id: string;
}

export type LectureTabContextType = {
  opened: string;
  setOpened: (opened: string | ((prev: string) => string)) => void;
};
