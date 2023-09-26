import { Book, Lecture, LectureTabContextType } from "@/types";
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
  const [isBookLoading, setIsBookLoading] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [book, setBook] = useState<Array<Book>>([]);
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

  const fetchData2 = async () => {
    setIsBookLoading(true);
    const requestData = {
      id: lecture.id, // ここにIDの値を設定
    };
    console.log(JSON.stringify(requestData));
    const response = await fetch("http://localhost:8080/book", {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    const data: Book[] = await response.json();
    setIsBookLoading(false);
    setBook(data);
  };
  return (
    <div className={`${styles.l_lecturetab} ${styles.d_lecturetab} tab`}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>
          <a href={lecture.url}>{lecture.name}</a>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <button onClick={fetchData} className={`${styles.button_hov}`}>
            理由
          </button>
          <button onClick={fetchData2} className={`${styles.button_hov}`}>
            本
          </button>
        </div>
      </div>
      {isBookLoading && "loading..."}
      {book.length >= 1 && (
        <div
          style={{
            paddingTop: "1rem",
            paddingBottom: "1rem",
            display: "grid",
            gap: "0.5rem",
          }}
        >
          <h4>おすすめの本</h4>
          {book.map((info) => (
            <BookCard info={info} key={info.name} />
          ))}
        </div>
      )}
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

const BookCard = ({ info }: { info: Book }) => {
  return (
    <div style={{ border: "0.03rem solid gray" }}>
      <div>タイトル: {info.name}</div>
      <div>著: {info.author}</div>
      <div>
        <a
          href={"https://topics.libra.titech.ac.jp/xc/search/" + info.name}
          style={{ color: "blue", textDecorationLine: "underline" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          図書館で調べる
        </a>
      </div>
    </div>
  );
};
