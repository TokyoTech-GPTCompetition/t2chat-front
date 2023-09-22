import styles from "@/styles/components/InputBox.module.scss";

const InputBox = () => {
  return (
    <div className={`${styles.l_input__wrapper}`}>
      <input
        className={`${styles.input}`}
        type="text"
        placeholder="メッセージを入力..."
      />
    </div>
  );
};

export default InputBox;
