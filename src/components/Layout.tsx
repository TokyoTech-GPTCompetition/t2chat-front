import { createContext, useState } from "react";
import InputBox from "./InputBox";
import LectureBox from "./LectureBox";
import styles from "@/styles/components/Layout.module.scss";
import { Lecture } from "@/types";
import { Header } from "./Header";

export const LectureContext = createContext<{
  isLoading: boolean;
  setIsLoading: (isLoading: boolean | ((prev: boolean) => boolean)) => void;
  lectures: Array<Lecture>;
  setLectures: (
    lectures: Array<Lecture> | ((prev: Array<Lecture>) => Array<Lecture>)
  ) => void;
}>({
  lectures: [],
  setLectures: (l) => {},
  isLoading: false,
  setIsLoading: (i) => {},
});

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [lectures, setLectures] = useState<Array<Lecture>>([]);
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  return (
    <LectureContext.Provider
      value={{ lectures, isLoading, setLectures, setIsLoading }}
    >
      <Header />
      <div className={`${styles.l_global__wrapper}`}>
        <LectureBox />
        {children}
        <InputBox />
      </div>
    </LectureContext.Provider>
  );
};

export default Layout;
