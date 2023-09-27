import styles from "@/styles/components/InputBox.module.scss";
import { Lecture } from "@/types";
import SendSharpIcon from "@mui/icons-material/SendSharp";
import { createContext, useContext, useRef, useState } from "react";
import { LectureContext } from "./Layout";

const InputBox = () => {
  const { isLoading, setIsLoading, lectures, setLectures } =
    useContext(LectureContext);
  const [message, setMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLButtonElement | SVGSVGElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    console.log("Click");
    setIsLoading(true); // Set isLoading to true when making the API request
    var id = 3;
    if (!message.includes("最適化")) {
      id = 5;
    }
    const requestData = {
      id: id.toString(), // ここにIDの値を設定
    };
    console.log(JSON.stringify(requestData));
    fetch("http://localhost:8080/lecture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        return res.json();
      })
      .then((data: Array<Lecture>) => {
        setLectures(data);
        setIsLoading(false); // Set isLoading to false when the response is received
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set isLoading to false when the response is received
      });
    e.preventDefault();
    e.currentTarget.blur();
    if (message === "") {
      return;
    }

    // アニメーション開始
    setIsAnimating(true);

    // メッセージを送信した後、アニメーションが終了したらアニメーションをリセット
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    setMessage("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.nativeEvent.isComposing ||
      !((e.metaKey || e.ctrlKey) && e.key === "Enter")
    ) {
      console.log(e.key);
      return;
    }
    console.log("worked");
    handleSubmit(e);
  };
  return (
    <form style={{ position: "fixed", bottom: "1.5rem", width: "100%" }}>
      <div className={`${styles.l_posttextarea__wrapper}`}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${styles.d_posttextarea} ${styles.l_posttextarea}`}
          placeholder="Send a message"
        ></textarea>
        <SendSharpIcon
          onClick={(e) => {
            console.log("send a message");
            handleSubmit(e);
          }}
          style={{
            cursor: "pointer",
            color: isAnimating ? "blue" : "black", // アニメーション状態に応じて色を変更
            transition: "color 0.2s", // 色の変化にトランジションを適用
          }}
        />
      </div>
    </form>
  );
};

export default InputBox;
