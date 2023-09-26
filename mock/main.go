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
	Id      string `json:"id"`
}

type LectureRes struct {
	Name     string `json:"name"`
	Abstract string `json:"abstract"`
	Url      string `json:"url"`
	Id       string `json:"id"`
}

type Reason struct {
	Id     string `json:"id"`
	Reason string `json:"reason"`
}

type ChatReq struct {
	ID string `json:"id"`
}

const DemoMessage = `科目名実践的並列コンピューティング 概要現代の科学技術を支える重要技術である、並列計算・高性能計算の基礎についての講義・実習を行います。化学分野における分子シミュレーション、生物分野における蛋白質解析、応用数学分野における数理最適化問題など、スーパーコンピュータ等による大量の計算量・データ量を必要とする計算技術への要求が高まっています。本講義では、MPIやOpenMPなど高性能・並列計算のための標準的なプログラミング環境に加え、近年注目を集めているGPU・アクセラレータのためのプログラミング環境についても解説を行います。座学だけでなく、実際に東工大のペタスケールスパコンであるTSUBAMEを用いた実習を行います。 この講義のキーワードは,並列計算, 高性能計算, マルチコア, MPI, OpenMP, GPGPUです．
`

var DemoLecture = []LectureRes{
	{
		Name:     "問題解決と意思決定",
		Abstract: "本講義では，システムの解析や設計において必要となる最適化のモデルと方法論について学びます．具体的には，線形計画モデル，線形計画法，非線形計画モデル，非線形計画法，多目的最適化手法，整数計画法，組合せ最適化手法など，最適化のためのモデル化と方法論について講義します．本講義を履修することによって，システムの解析や設計において必要となる最適化に関する知識を習得し，実世界の問題に応用できるようになることを到達目標とします． この講義のキーワードは,線形計画，非線形計画，多目的最適化，整数計画，組合せ最適化です．",
		Url:      "https://google.com",
		Id:       "30405",
	},
	{
		Name:     "数理最適化",
		Abstract: "この科目は講義と演習からなる。講義の部分では、数理最適化モデルの基礎となっている線形計画問題について、代表的な解法であるシンプレックス法および双対定理などの理論面を扱う。非線形最適化では、最適解の満たす最適性条件の理論的性質についてふれた後、最急降下法や内点法などの計算手法を扱う。演習の部分では、シンプレックス法を実際に線形計画問題に適用し、その手順を確認する。また、講義内容の証明の一部などを行うことで、理論面の理解を深める。数理最適化は、「特定の条件を満たす中から、最適な解を選び出す」という最適化に数学的なアプローチを行う学問であり、理学・工学の諸問題と密接に関係しているだけでなく、実社会に幅広く用いられている。例えば、必要なエネルギーを確保する食事メニューの中から、最小カロリーとなっているメニューを選び出す、などのようなダイエット問題を数学でどのように解くか、というようなことが考えられる。実社会の最適化問題をどのような数学的性質を使って性質をどのような手順で解いていくのか、理論面と計算面の２つを楽しめる科目である。 この講義のキーワードは,線形計画問題，シンプレックス法，双対理論，感度分析，最短路問題，最大流問題，凸関数，非線形最適化問題の最適性条件，Karush-Kuhn-Tucker 条件，最急降下法，Newton 法，逐次２次計画法，内点法です．",
		Url:      "https://google.com",
		Id:       "30406",
	},
}

var DemoReason = map[string]Reason{
	"30405": {
		Id: "30405",
		Reason: `# 推薦理由(問題解決と意思決定)

私は、[問題解決と意思決定]の授業を強くお勧めします。この授業は、[私の目標]である「数理最適化を用いて貧困問題を解決したい」という目標を達成するために必要な知識とスキルを身につけることができます。以下に、授業の内容が目標達成にどのように役立つかを説明します。

1. **線形計画モデルと線形計画法**: この授業では、線形計画モデルと線形計画法について学びます。これらの手法は、貧困問題を解決するための資源配分や政策決定において、効率的な解決策を見つけるために役立ちます。
2. **非線形計画モデルと非線形計画法**: 貧困問題において、すべての変数や制約が線形であるとは限りません。非線形計画モデルと非線形計画法を学ぶことで、より現実的な問題設定に対応する最適化手法を習得できます。
3. **多目的最適化手法**: 貧困問題を解決するためには、経済成長、教育、健康、インフラなど、さまざまな目標を同時に達成する必要があります。多目的最適化手法を学ぶことで、これらの目標をトレードオフしながら最適な解決策を見つけることができます。
4. **整数計画法**: 貧困問題において、整数でなければならない変数（例えば、人数や施設の数）が存在することがあります。整数計画法を学ぶことで、このような制約を持つ問題に対処することができます。
5. **組合せ最適化手法**: 貧困問題を解決するためには、さまざまな選択肢の中から最適な組み合わせを見つける必要があります。組合せ最適化手法を学ぶことで、効率的に最適な選択肢を見つけることができます。

以上の理由から、[科目名問題解決と意思決定]の授業は、[私の目標]である「数理最適化を用いて貧困問題を解決したい」という目標を達成するために必要な知識とスキルを習得するために最適な授業です。この授業を受講することで、実世界の問題に対して最適化手法を応用し、貧困問題の解決に貢献できるようになるでしょう。`,
	},
	"30406": {
		Id: "30406", Reason: `# 推薦理由(数理最適化)

数理最適化の授業は、貧困問題を解決するために非常に重要な役割を果たします。この授業では、線形計画問題や非線形最適化問題などの最適化手法を学ぶことができます。これらの手法は、貧困問題に対する効果的な解決策を見つけるために役立ちます。

まず、線形計画問題とシンプレックス法を学ぶことで、貧困問題に関連するリソースの最適な配分を見つけることができます。例えば、限られた予算の中で、教育や医療、インフラなどの分野にどのように資源を割り振るべきかを決定することができます。また、双対理論や感度分析を用いて、各分野への投資が貧困削減にどの程度の効果をもたらすかを評価することもできます。

次に、最短路問題や最大流問題を学ぶことで、貧困地域への物資やサービスの効率的な配送ルートを見つけることができます。これにより、貧困地域への支援が迅速かつ効果的に行われることが期待できます。

さらに、非線形最適化問題の最適性条件やKarush-Kuhn-Tucker条件を学ぶことで、貧困問題に対するより複雑な解決策を見つけることができます。例えば、経済成長と環境保護のバランスを考慮した持続可能な開発戦略を立案することができます。

最後に、最急降下法やNewton法、逐次二次計画法、内点法などの計算手法を学ぶことで、貧困問題に対する最適解を効率的に求めることができます。これにより、貧困問題の解決策を迅速に実行に移すことができます。

総じて、数理最適化の授業は、貧困問題を解決するために必要な理論的知識と計算手法を提供します。これらの知識と手法を活用することで、貧困問題に対する効果的で持続可能な解決策を見つけることができるでしょう。`,
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
			var reqData ChatReq
			if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
				fmt.Println("called")
				http.Error(w, "Invalid request body", http.StatusBadRequest)
				return
			}
			id := reqData.ID
			fmt.Printf("%v\n", id)
			flusher, ok := w.(http.Flusher)
			if !ok {
				http.Error(w, "SSE not supported", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			chunkCh := make(chan string)
			go chunkGenerator(r.Context(), chunkCh, DemoReason[id].Reason)
			var data ChatRes
			for chunk := range chunkCh {
				data.Message = chunk
				data.Lecture = "サンプル講義"
				event, err := sseFormatter(data)
				if err != nil {
					fmt.Println(err)
					break
				}
				fmt.Printf("%v\n", chunk)
				_, err = fmt.Fprint(w, event)
				if err != nil {
					fmt.Println(err)
					break
				}

				flusher.Flush()
			}
		}
	case http.MethodOptions:
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
	}
}

func chunkGenerator(c context.Context, chunkCh chan string, demoM string) {
	ticker := time.NewTicker(time.Millisecond * 40)

	msg := []rune(demoM)
	msgLength := len(msg)

loop:
	for i := 0; i < msgLength; i++ {
		select {
		case <-c.Done():
			break loop
		case <-ticker.C:
			chunkCh <- string(msg[i]) // UTF-8 エンコードされた文字列を送信
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
		time.Sleep(9 * time.Second)
		if err := json.NewEncoder(w).Encode(DemoLecture); err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
			return
		}
	}
}
