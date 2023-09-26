import { Lecture, LectureTabContextType } from "@/types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import styles from "@/styles/components/LectureBox.module.scss";
import { LectureContext } from "./Layout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LectureBox = ({ children }: { children?: React.ReactNode }) => {
  const { isLoading, setIsLoading, lectures, setLectures } =
    useContext(LectureContext);
  const [opened, setOpened] = useState<string>("");

  return (
    <div className={`${styles.l_lecturebox__wrapper}`}>
      <h1>Lecture List</h1>
      {isLoading ? (
        <div className={`${styles.loadingIndicator}`}>Loading...</div>
      ) : (
        <ul className={`${styles.l_lecturelist} ${styles.d_lecturelist}`}>
          {lectures.map((lecture: Lecture, index: number) => (
            <li
              key={index}
              className={`${styles.d_lecturelist__unit}`}
              onClick={() => {
                setOpened(lecture.id);
              }}
            >
              <h2>{lecture.name}</h2>
              <hr />
              <p className={`${styles.d_lecturelist__abstract}`}>
                {lecture.abstract}
              </p>
              {opened === lecture.id && <LectureTab lecture={lecture} />}
            </li>
          ))}
        </ul>
      )}

      {opened !== "" && (
        <div
          className={`${styles.l_tabbackground}`}
          onClick={() => {
            setOpened("");
          }}
        ></div>
      )}
    </div>
  );
};

export default LectureBox;

const LectureTab = ({
  lecture,
  setOpened,
}: {
  lecture: Lecture;
  setOpened?: (opened: string | ((prev: string) => string)) => void;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  console.log(typeof reason);
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const requestData = {
        id: lecture.id, // ここにIDの値を設定
      };
      console.log(JSON.stringify(requestData));
      // APIを呼び出すコードをここに追加
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      const data = response.body;
      if (data === null) {
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder("UTF-8");
      let done = false;
      let result = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        var jsonData;
        var tmp = chunkValue.split("data: ")[1];
        if (tmp !== undefined) {
          jsonData = JSON.parse(tmp);
          if (jsonData["message"] === "\n") {
            // result += "<br />";
            result += jsonData["message"];
          } else {
            result += jsonData["message"];
          }
        }
        console.log(result + (done ? "" : "▊"));
        setReason(result + (done ? "" : "▊"));
      }
    } catch (error) {
      console.error("API呼び出しエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={`${styles.l_lecturetab} ${styles.d_lecturetab} tab`}>
      <h2>
        <a href={lecture.url}>{lecture.name}</a>
      </h2>
      <button onClick={fetchData}>理由</button>
      <button>本</button>
      <p style={{ paddingBottom: "1.5rem" }}>{lecture.abstract}</p>
      {/*<p dangerouslySetInnerHTML={{ __html: reason }}></p>*/}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className={`${styles.markdown}`}
      >
        {reason}
      </ReactMarkdown>
    </div>
  );
};
