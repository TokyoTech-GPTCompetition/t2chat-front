import InputBox from "./InputBox";
import LectureBox from "./LectureBox";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <LectureBox />
      {children}
      <InputBox />
    </>
  );
};

export default Layout;
