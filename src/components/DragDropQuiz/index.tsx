import { ReactNode, createContext, useContext, useState } from "react";
import styles from './styles.module.css';

export const WordsArrayContext = createContext({data:[""], setter:(word:string) => {}});

export function DragDropQuiz(props: {children: any, name: string}) : ReactNode {
    const [wordsList, setWordList] = useState([]);

    const addWordToList = (word:string) => {
        // Need to check if word already in the list first
        if (!wordsList.includes(word)){
            setWordList([...wordsList, word])
        }
    }

    return (<div>
        <WordsArrayContext.Provider value={{data: wordsList, setter: addWordToList}}>
            <p>
                <strong>Drag and drop words from the bank at the bottom into the blanks.</strong>
            </p>
            <div id="quiz" quiz-name={props.name}>
            <span className={styles.hidden}>Questions:</span>
            {props.children}
            {/* Hidden text for submission copy */}
            <span className={styles.hidden}>Word Bank:</span>
            <div className={styles.wordbank}>
                {shuffle(wordsList.map(word => Word(word)))}
            </div>
            </div>
        </WordsArrayContext.Provider>
        <br/>
        <button onClick={validate} className={styles.checkButton}>Check Answers</button>
        <br/>
        <div id="success-div" style={{display:"none"}}>
            <h3>Congratulations!</h3>
            <p>
                Enter your name and submit your results. Wait a second or two after pressing the submit button for confirmation.
            </p>
            <label htmlFor="name-input">Your Name: </label>
            <input id="name-input" name="name-input" type="text"></input>
            <button id="submit" style={{marginLeft: '1em'}} onClick={submit}>Submit</button>
        </div>
    </div>)
}

export function Blank(props: {width:number, answer:string}) : ReactNode {
    const wordsArray = useContext(WordsArrayContext);
    wordsArray.setter(props.answer);
    return (
            <span>
            {/* Hidden text for submission copy */}
            <span className={styles.hidden}>|</span>
            <span quiz-answer={props.answer} className={styles.blank} onDragOver={dragoverHandler} onDrop={dropHandler} style={{minWidth: Math.max(props.width, 2) + 'em' }}>&nbsp;</span>
            <span className={styles.hidden}>|</span>
            </span>
    )
}

function Word(text: string) {
 return (
    <div className={styles.word} key={text} draggable="true" onDragStart={dragstartHandler}>{text}</div>
 )
}

function dragstartHandler(ev){
  ev.dataTransfer.setData("text", ev.target.innerText)
}

function dragoverHandler(ev){
  ev.preventDefault();
}

function dropHandler(ev){
  console.log("Drop")
  ev.preventDefault()
  const text = ev.dataTransfer.getData("text");
  console.log(text);
  ev.target.innerText = text;
}

function shuffle<T>(array: T[]) : T[] {
    let out:T[] = [];
    let value = [...array]
    while(value.length > 0){
        let idx = Math.floor(Math.random() * value.length);
        out.push(value[idx]);
        value.splice(idx, 1);
    }
    return out;
}

function validate() : boolean{
    var blanks = Array.from(document.getElementsByClassName(styles.blank));
    let correct = true;
    for (let blank of blanks){
        let answer = blank.getAttribute("quiz-answer");
        let value = blank.textContent;
        blank.classList.remove(styles.correct, styles.incorrect);
        if(answer === value){
            blank.classList.add(styles.correct);
        }
        else {
            correct = false;
            blank.classList.add(styles.incorrect);
        }
    }
    if (correct){
        document.getElementById("success-div").style.display = "block";
    }
    else {
        document.getElementById("success-div").style.display = "none";
    }

    return correct;
}

function submit(){
    if (!validate()){
        alert("Answers not correct, please fix before submitting")
        return;
    }

    // Get the full quiz for recordkeeping
    let fullContent = document.getElementById("quiz").innerText;
    let quizName = document.getElementById("quiz").getAttribute("quiz-name");
    
    // Get just the submitted answers for summary
    let submitted = "";
    let solution = "";
    var blanks = Array.from(document.getElementsByClassName(styles.blank));
    for (let blank of blanks){
        submitted += `${blank.textContent}, `;
        solution += `${blank.getAttribute("quiz-answer")}, `
    }

    let input : any = document.getElementById("name-input");
    let name = input.value;

    let body = `${name} Completed the quiz ${quizName}\n\nTheir answers:\n${submitted}\nSolution:\n${solution}\n\nFull Quiz Content:\n${fullContent}`
    console.log(body);

    // Really lazy obfuscation since this will be public
    let id1 = "api-"
    let id2 = "EA85A"
    let id4 = "A7944"
    let id5a = "93926"
    let id5b = "EA92"
    let id5 = id5a + id5b;

    // Send as email
    fetch('https://api.smtp2go.com/v3/email/send', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            "api_key": `${id1}${id2}E61A${id4}${id5}33E1F5772`,
            "sender": "safetytraining@gregk.ca",
            "to": "machinemavericks@gmail.com",
            "subject": `Safety Quiz Submission: ${name}/${quizName}`,
            "text_body": body
        })
    }).then((response) => {
        if(response.status != 200){
            alert("Error sending submission email, let Greg know")
        }
        else {
            alert("Submitted")
        }
        console.log(response);
        response.text().then(text => {
            console.log(text)
        })
    })
}