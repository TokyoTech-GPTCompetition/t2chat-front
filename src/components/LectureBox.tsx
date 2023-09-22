import { Lecture } from "@/types";
import { useEffect, useState } from "react";

const LectureBox = ({ children }: { children?: React.ReactNode }) => {
  const [lectures, setLectures] = useState<Array<Lecture>>([]);
  useEffect(() => {
    fetch("http://localhost:8080/lecture", { method: "POST" })
      .then((res) => {
        return res.json();
      })
      .then((data: Array<Lecture>) => {
        setLectures(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  return (
    <div>
      <h1>Lecture List</h1>
      <ul>
        {lectures.map((lecture: Lecture, index: number) => (
          <li key={index}>
            <h2>{lecture.name}</h2>
            <p>{lecture.abstract}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LectureBox;
