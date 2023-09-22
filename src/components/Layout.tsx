import InputBox from "./InputBox";
import LectureBox from "./LectureBox";
import styles from "@/styles/components/Layout.module.scss";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className={`${styles.l_global__wrapper}`}>
      <LectureBox />
      {children}
      <InputBox />
    </div>
  );
};

export default Layout;
