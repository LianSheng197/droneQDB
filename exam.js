/**
 * @typedef {Object} QuestionOptions
 * @property {string} a
 * @property {string} b
 * @property {string} c
 * @property {string} d
 */

/**
 * @typedef {Object} Question
 * @property {number} number
 * @property {string} description
 * @property {QuestionOptions} options
 * @property {number} section
 * @property {string} answer
 */

/**
 * @typedef {Object} SectionTitle
 * @property {string} s1
 * @property {string} s2
 * @property {string} s3
 * @property {string} s4
 */

/**
 * @typedef {Object} AllQuestions
 * @property {string} version
 * @property {SectionTitle} sectionTitle
 * @property {Object.<string, Question>} data
 */



(() => {
    let count = 0;

    init();

    /**
     * 就是初始化
     */
    function init() {
        const opt20 = document.querySelector("#opt20");
        const opt50 = document.querySelector("#opt50");
        const opt100 = document.querySelector("#opt100");

        opt20.onclick = () => prepareExam(20);
        opt50.onclick = () => prepareExam(50);
        opt100.onclick = () => prepareExam(100);
    }

    /**
     * 準備測驗
     * @param {number} questions
     */
    async function prepareExam(questions) {
        // 隨機題目 id
        const selectedQuestions = [];

        /** @type {AllQuestions} */
        const allQuestions = await fetch("result.json").then(r => r.json());
        const allQuestionKeys = Object.keys(allQuestions.data);

        while (selectedQuestions.length < questions) {
            const thisKey = allQuestionKeys[Math.floor(Math.random() * allQuestionKeys.length)];

            if (!selectedQuestions.includes(thisKey)) {
                selectedQuestions.push(thisKey);
            }
        }

        // 答題狀況
        const answerResult = [];
        doExam(selectedQuestions);

        /**
         * 開始測驗
         * @param {string[]} allQuestions 
         * @param {number} count 
         */
        function doExam(allQuestionKeys, count = 0) {
            const currentTitle = document.querySelector("#currentTitle");
            const content = document.querySelector("#content");
            const space = document.createElement("div");
            space.classList.add("ts-space");

            count++;
            setProgress(count / allQuestionKeys.length * 100);

            if (count <= allQuestionKeys.length) {
                currentTitle.innerText = `第 ${count} 題`;
                const key = allQuestionKeys[count - 1];
                const question = allQuestions.data[key];
                showQuestion(question);
            } else {
                showExamResult();
            }

            /**
             * 顯示題目及綁定事件
             * @param {Question} questionData 
             */
            function showQuestion(questionData) {
                content.innerHTML = "";

                // 問題描述
                const description = document.createElement("div");
                description.classList.add("ts-segment");
                description.innerText = questionData.description;
                content.append(description, space.cloneNode(), space.cloneNode());

                // 送出答案
                const submit = document.createElement("button");
                submit.classList.add("ts-button", "is-large", "is-fluid", "is-disabled", "_submit");
                submit.innerText = "送出答案";
                submit.onclick = () => showQuestionResult(selectedOption, questionData.answer);
                submit.disabled = true;

                // 選項
                let selectedOption;
                ["a", "b", "c", "d"].forEach(opt => {
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = "option";

                    const textNode = document.createTextNode(questionData.options[opt]);

                    const label = document.createElement("label");
                    label.classList.add("ts-radio");
                    label.onclick = () => {
                        selectedOption = opt;
                        submit.disabled = false;
                        submit.classList.remove("is-disabled");
                    };

                    label.append(input, textNode);
                    content.append(label, space.cloneNode());
                });

                content.append(space.cloneNode(), submit);
            }

            /**
             * 顯示單題結果
             * @param {string} selected
             * @param {string} answer
             */
            function showQuestionResult(selected, answer) {
                answerResult.push(selected);
                const options = document.querySelectorAll("input[name='option']");
                const submit = document.querySelector("button._submit");
                const map = {
                    a: 0,
                    b: 1,
                    c: 2,
                    d: 3
                };

                options[map[answer]].parentElement.style.color = "var(--ts-positive-400)";

                if (selected !== answer) {
                    options[map[selected]].parentElement.style.color = "var(--ts-negative-400)";
                }

                options.forEach(opt => {
                    opt.disabled = true;
                    opt.classList.add("is-disabled");
                });

                submit.innerText = "繼續";
                submit.onclick = () => doExam(allQuestionKeys, count);
            }

            /**
             * 顯示測驗結果
             */
            function showExamResult() {
                content.innerHTML = "";

                // 錯誤題目的 index（根據試驗時的順序）
                const wrongAnswerIndexes = [];
                answerResult.forEach((ans, idx) => {
                    const key = allQuestionKeys[idx];
                    const realAnswer = allQuestions.data[key].answer;

                    if (ans !== realAnswer) {
                        wrongAnswerIndexes.push(idx);
                    }
                });

                currentTitle.innerText = "測驗結果";

                const correct = questions - wrongAnswerIndexes.length;
                const desc = document.createElement("div");
                desc.classList.add("ts-text");
                desc.innerHTML = `在 ${questions} 道題目中，你一共答對了 ${correct} 道題，答對率 <b>${parseInt(correct / questions * 100)}%</b>。`;
                content.append(desc, space.cloneNode());

                const desc2 = document.createElement("div");
                desc2.classList.add("ts-text");
                desc2.innerText = "下面是錯誤的題目：";
                content.append(desc2, space.cloneNode());

                wrongAnswerIndexes.forEach(ans => {
                    const key = allQuestionKeys[ans];
                    const questionData = allQuestions.data[key];

                    const description = document.createElement("div");
                    description.classList.add("ts-segment");
                    description.innerHTML = `
                    <b>（第 ${questionData.section} 章 - ${allQuestions.sectionTitle["s" + questionData.section]}，第 ${questionData.number} 題）</b><br><br>
                    第 ${ans+1} 題 - ${questionData.description}
                    `;
                    content.append(description, space.cloneNode());

                    ["a", "b", "c", "d"].forEach(opt => {
                        const text = document.createElement("div");
                        text.classList.add("ts-text");
                        text.innerText = questionData.options[opt];

                        if (answerResult[ans] === opt) {
                            text.style.color = "var(--ts-negative-400)";
                        }

                        if (questionData.answer === opt) {
                            text.style.color = "var(--ts-positive-400)";
                        }

                        content.append(text, space.cloneNode());
                    });

                    content.append(space.cloneNode(), space.cloneNode(), space.cloneNode());
                });

                const submit = document.createElement("button");
                submit.classList.add("ts-button", "is-large", "is-fluid", "_submit");
                submit.innerText = "再試一次";
                submit.onclick = () => location.reload();
                content.append(submit, space.cloneNode(), space.cloneNode(), space.cloneNode(), space.cloneNode(), space.cloneNode());
            }
        }
    }

    /**
     * 設定進度條狀態
     * @param {number} percent 
     */
    function setProgress(percent) {
        const progressBar = document.querySelector("#progressBar");
        progressBar.style.setProperty("--value", percent);
    }
})();