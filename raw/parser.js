import * as fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const rawQuestionN = "./rawQ<N>.txt";
const rawAnswerN = "./rawA<N>.txt";
const resultFile = "result.json";
const data = {
    version: "1110707",
    sectionTitle: {
        s1: "民用航空法及相關法規",
        s2: "基礎飛行原理",
        s3: "氣象",
        s4: "緊急處置與飛行決策"
    },
    data: {}
};

// Question
for (let section = 1; section <= 4; section++) {
    const rawFile = `${__dirname}/${rawQuestionN.replace("<N>", section)}`;
    const content = fs.readFileSync(rawFile).toString();
    const lines = content.split("\n");

    let currentQuestion = {};
    let currentOptions = {};
    lines.forEach((ln, index) => {
        if (ln.startsWith(" ".repeat(4))) {
            const thisQuestion = ln.trim().split(". ");
            currentQuestion.number = thisQuestion[0] - 0;
            currentQuestion.description = thisQuestion.splice(1).join(" ");
        } else if (ln.match(/^\([ABCD]\)/)) {
            const thisOption = ln.trim().split(" ");
            const thisId = thisOption[0].replace(/[\(\)]/g, "").toLowerCase();
            const thisDescription = thisOption.splice(1).join(" ");
            currentOptions[thisId] = thisDescription;
        } else if (ln === "") {
            currentQuestion.options = currentOptions;
            currentQuestion.section = section;
            data.data[`S${section}-${currentQuestion.number}`] = currentQuestion;
            currentQuestion = {};
            currentOptions = {};
        } else {
            throw new Error(`不明的格式，解析中止。| Sec #${section} | Q-${currentQuestion.number} | Ln ${index + 1} | File '${rawFile}'`);
        }

        // 處理最後一行，避免漏掉最後一題
        if (index === lines.length - 1) {
            currentQuestion.options = currentOptions;
            currentQuestion.section = section;
            data.data[`S${section}-${currentQuestion.number}`] = currentQuestion;
            currentQuestion = {};
            currentOptions = {};
        }
    });
}

// Answer
for (let section = 1; section <= 4; section++) {
    const rawFile = `${__dirname}/${rawAnswerN.replace("<N>", section)}`;
    const content = fs.readFileSync(rawFile).toString();
    const lines = content.split("\n");

    lines.forEach((ln, index) => {
        if (ln.match(/^\d+\.\ [ABCD]$/)) {
            const thisAnswer = ln.split(". ");
            const number = thisAnswer[0] - 0;
            const option = thisAnswer[1].toLowerCase();
            const thisIndex = `S${section}-${number}`;

            if(data.data[thisIndex] !== undefined) {
                data.data[thisIndex].answer = option;
            } else {
                throw new Error(`解析錯誤，不存在的題目。| Question Index '${thisIndex}' | Ln ${index + 1} | File '${rawFile}'`);    
            }
        } else {
            throw new Error(`不明的格式，解析中止。| Sec #${section} | Ln ${index + 1}`);
        }
    });
}

fs.writeFileSync(`${__dirname}/${resultFile}`, JSON.stringify(data, null, 2));