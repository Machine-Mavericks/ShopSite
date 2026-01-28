import { ReactNode, createContext, useContext, useState } from "react";
import styles from './styles.module.css';

export const WordsArrayContext = createContext({data:[""], setter:(word:string) => {}});

export function DragDropQuiz(props: {children: any}) : ReactNode {
    const [wordsList, setWordList] = useState([]);

    const addWordToList = (word:string) => {
        // Need to check if word already in the list first
        if (!wordsList.includes(word)){
            setWordList([...wordsList, word])
        }
    }

    return (<div>
        <WordsArrayContext.Provider value={{data: wordsList, setter: addWordToList}}>
            {props.children}
            {shuffle(wordsList.map(word => Word(word)))}
        </WordsArrayContext.Provider>
    </div>)
}

export function Blank(props: {width:number, answer:string}) : ReactNode {
    const wordsArray = useContext(WordsArrayContext);
    wordsArray.setter(props.answer);
    return <span className={styles.blank} onDragOver={dragoverHandler} onDrop={dropHandler} style={{minWidth: Math.max(props.width, 2) + 'em' }}>&nbsp;</span>
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