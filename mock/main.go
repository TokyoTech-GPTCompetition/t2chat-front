package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ChatRes struct {
	Lecture string `json:"lecture"`
	Message string `json:"message"`
	Url     string `json:"url"`
}

type LectureRes struct {
	Name     string `json:"name"`
	Abstract string `json:"abstract"`
}

const DemoMessage = `hello\
this is sample message\
nice to meet you
`

var DemoLecture = []LectureRes{
	{
		Name:     "Lecture 1",
		Abstract: "This is the abstract for Lecture 1.",
	},
	{
		Name:     "Lecture 2",
		Abstract: "This is the abstract for Lecture 2.",
	},
}

func main() {
	http.HandleFunc("/chat", chatHandler)
	http.HandleFunc("/lecture", lectureHandler)
	http.ListenAndServe(":8080", nil)
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		{
			flusher, ok := w.(http.Flusher)
			if !ok {
				http.Error(w, "SSE not supported", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "text/event-stream")
			w.Header().Set("Access-Control-Allow-Origin", "*")

			chunkCh := make(chan string)
			go chunkGenerator(r.Context(), chunkCh)
			var data ChatRes
			for chunk := range chunkCh {
				data.Message = chunk
				data.Lecture = "サンプル講義"
				data.Url = "サンプルURL"
				event, err := sseFormatter(data)
				if err != nil {
					fmt.Println(err)
					break
				}

				_, err = fmt.Fprint(w, event)
				if err != nil {
					fmt.Println(err)
					break
				}

				flusher.Flush()
			}
		}
	}
}

func chunkGenerator(c context.Context, chunkCh chan string) {
	ticker := time.NewTicker(time.Second)

	msgLength := len(DemoMessage)
	msgIndex := 0

loop:
	for {
		select {
		case <-c.Done():
			break loop
		case <-ticker.C:
			if msgIndex >= msgLength {
				break loop
			}
			chunkCh <- string(DemoMessage[msgIndex])
			msgIndex++
		}
	}

	ticker.Stop()
	close(chunkCh)
}

func sseFormatter(data any) (string, error) {
	m, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	buf := bytes.NewBuffer([]byte{})

	_, err = buf.Write(m)

	if err != nil {
		return "", err
	}

	sseData := fmt.Sprintf("data: %v\n\n", buf.String())
	return sseData, nil
}

func lectureHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		if err := json.NewEncoder(w).Encode(DemoLecture); err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
			return
		}
	}
}
