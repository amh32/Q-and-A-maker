// Programmer: amh32
// Last modified: 5/30/2022
// Brief descripion: A custom quiz maker

// Long Description: A custom quiz maker that allows a novice programmer to 
// easily create questions with any amount of choices and chose the next frame it connects to.
// It also allows for the next frame to be dynamically determined by previously recorded data.
// Frame creation functions return the frame index (nextFrameIndex) that is used to proceed to it.
// Frames can be created in any order, regardless of the nextFrameIndex.
// This program is a model/prototype, feel free to copy and modify it.

function main() {

    //The below code in this function is an example of creating a quiz

    var quiz = new Quiz("main_wrapper");

    quiz.createStatement("Example Quiz", 1); //Frame 0
    quiz.createQuestion("1) true or false?"); //Frame 1
    quiz.createStatement("True Selected", 4); //Frame 2
    quiz.createStatement("False Selected", 4); //Frame 3
    quiz.questions[0].addChoice("true", 2);
    quiz.questions[0].addChoice("false", 3);
    quiz.createRefStatement("Answer of \"", quiz.data, 0, "\" saved", 5); //Frame 5, also can be commented out with no errors

    const question2Index = quiz.createQuestion("2) Again, true or false?");
    quiz.questions[1].addRadioChoice("true", question2Index + 1);
    quiz.questions[1].addRadioChoice("false", question2Index + 2);
    quiz.createEqualToSwitch(0, "True", question2Index + 3, question2Index + 4);
    quiz.createEqualToSwitch(0, "True", question2Index + 4, question2Index + 5);
    quiz.createStatement("True selected twice", question2Index + 6);
    quiz.createStatement("Both selected", question2Index + 6);
    quiz.createStatement("False selected twice", question2Index + 6);

    quiz.createStatement("Returning to start", 0);

    quiz.frames[0].addToDoc();
}


class Quiz {
    constructor(parentElementId) {
        this.frames = new Array;
        this.statements = new Array;
        this.questions = new Array;
        this.data = new Array;

        this.el = document.createElement("div");
        this.el.setAttribute("id", "quiz");
        this.el.setAttribute("class", "quiz");
        this.el.setAttribute("className", "quiz");
        document.getElementById(parentElementId).insertAdjacentElement("beforeend", this.el);
        this.el = document.getElementById("quiz");
    }

    createStatement(text, nextFrameIndex) {
        const statementIndex = this.statements.length;
        const frameIndex = this.frames.length;
        var statement;

        if (typeof text === 'string' || text instanceof String) {
            statement = new Statement(frameIndex, statementIndex, text, [""], 0, "", nextFrameIndex, this);
        }
        else if (typeof text === 'array' || text instanceof Array) {
            statement = new Statement(frameIndex, statementIndex, "", text, 0, "", nextFrameIndex, this);
        }
        else {
            statement = new Statement(frameIndex, statementIndex, "ERROR: invalid statement args", [""], 0, "", nextFrameIndex, this);
        }

        this.frames.push(statement);
        this.statements.push(statement);
        return statement.frameIndex;
    }
    createRefStatement(pretext, array, index, posttext, nextFrameIndex) {
        const statement = new Statement(this.frames.length, this.statements.length, pretext, array, index, posttext, nextFrameIndex, this);
        this.frames.push(statement);
        this.statements.push(statement);
        return statement.frameIndex;
    }

    createQuestion(text) {
        const question = new Question(this.frames.length, this.questions.length, text, this);
        this.frames.push(question);
        this.questions.push(question);
        return question.frameIndex;
    }
    createEqualToSwitch(dataIndex, comparison, PI1, PI2) {
        const frame = new EqualToSwitch(this.frames.length, dataIndex, comparison, PI1, PI2, this);
        this.frames.push(frame);
        return frame.frameIndex;
    }
}

//The statement's text can be recieved as an array entry instead of a string so that it can be called by reference,
//and the index argument is simply to access it.
class Statement {
    constructor(frameIndex, statementIndex, pretext, textArray, index, posttext, nextFrameIndex, parent) {
        this.id = "statement" + statementIndex;
        this.frameIndex = frameIndex;
        this.statementIndex = statementIndex;
        this.pretext = pretext;
        this.textArray = textArray;
        this.index = index;
        this.posttext = posttext;
        this.nextFrameIndex = nextFrameIndex;
        this.el = null;
        this.parent = parent;

        this.el = document.createElement("p");
        this.el.setAttribute("id", this.id);

        this.el.setAttribute("class", "statement");
        this.el.setAttribute("classname", "statement");
        this.el.setAttribute("readonly", true);

        this.button = document.createElement("button");
        this.button.setAttribute("class", "submit_button");
        this.button.setAttribute("className", "submit_button");
        this.button.addEventListener("click", this.nextHandler.bind(this));
        this.button.insertAdjacentText("beforeend", "next");
    }

    addToDoc() {
        this.el.insertAdjacentText("beforeend", this.pretext + this.textArray[this.index] + this.posttext);
        this.parent.el.insertAdjacentElement("beforeend", this.el);
        this.el.insertAdjacentElement("afterend", this.button);
    }

    removeFromDoc() {
        this.el.remove();
        this.el.innerText = null;
        this.button.remove();
    }

    proceed() {
        this.removeFromDoc();
        if (this.parent.frames[this.nextFrameIndex] != null) this.parent.frames[this.nextFrameIndex].addToDoc();
    }

    nextHandler() {
        this.proceed();
    }
}

class Question {
    constructor(frameIndex, questionIndex, text, parent) {
        this.id = "question" + questionIndex;
        this.frameIndex = frameIndex;
        this.questionIndex = questionIndex;
        this.text = text;
        this.nextFrame = null;
        parent.data.push(null);
        this.parent = parent;
        this.answers = new Array; //currently only length is used, maybe replace

        this.el = document.createElement("form");
        this.el.setAttribute("id", this.id);
        this.el.setAttribute("class", "question");
        this.el.setAttribute("className", "question");
        this.el.insertAdjacentText("afterbegin", this.text);

        this.choiceArea = document.createElement("div");
        this.choiceArea.setAttribute("id", "choice_area");
        this.el.insertAdjacentElement("beforeend", this.choiceArea);

        this.submitbutton = document.createElement("button");
        this.submitbutton.setAttribute("class", "submit_button");
        this.submitbutton.setAttribute("className", "submit_button");
        this.submitbutton.insertAdjacentText("beforeend", "submit");
        this.el.insertAdjacentElement("beforeend", this.submitbutton);
        this.el.addEventListener("submit", this.submitHandler.bind(this));
    }

    addToDoc() {
        this.parent.el.insertAdjacentElement("beforeend", this.el);
    }

    removeFromDoc() {
        if (this.el != null) this.el.remove();
        //if (this.submitButton != null) this.submitbutton.remove();
    }

    submitHandler() {
        this.proceed();
    }

    proceed() {
        this.removeFromDoc();
        if (this.nextFrame != null) this.nextFrame.addToDoc();
    }

    addChoice(text, nextFrameIndex) {
        var choice = new Choice(this.answers.length, text, nextFrameIndex, this);
        this.answers.push(choice);
    }

    choiceHandler(gainedData, nextFrameIndex) {
        this.nextFrame = this.parent.frames[nextFrameIndex];
        this.parent.data[this.questionIndex] = gainedData;
    }

    addRadioChoice(text, nextFrameIndex) {
        var choice = new Radio(this.answers.length, text, nextFrameIndex, this);
        this.answers.push(choice);
    }

    radioHandler(nextFrameIndex) {
        this.nextFrame = this.parent.frames[nextFrameIndex];
        this.parent.data[this.questionIndex] = this.el.radio;
    }
}

class Choice {
    constructor(answerIndex, text, nextFrameIndex, parent) {
        this.id = "choice" + answerIndex;
        this.answerIndex = answerIndex;
        this.text = text;
        this.nextFrameIndex = nextFrameIndex;
        this.parent = parent;

        this.el = document.createElement("button");
        this.el.setAttribute("id", this.id);
        this.el.setAttribute("class", "choice");
        this.el.setAttribute("className", "choice");
        this.el.insertAdjacentText("beforeend", this.text);

        this.el.addEventListener("click", this.clickHandler.bind(this));

        this.parent.choiceArea.insertAdjacentElement("beforeend", this.el);
    }

    clickHandler(event) {
        event.preventDefault();
        this.parent.choiceHandler(this.text, this.nextFrameIndex);
    }
}

class Radio {
    constructor(radioIndex, text, nextFrameIndex, parent) {
        this.id = "radioChoice" + radioIndex;
        this.radioIndex = radioIndex;
        this.parent = parent;
        this.text = text;
        this.nextFrameIndex = nextFrameIndex;

        this.el = document.createElement("input");
        this.el.setAttribute("value", nextFrameIndex);
        this.el.setAttribute("type", "radio");
        this.el.setAttribute("id", this.id);
        this.el.setAttribute("name", "radioChoice");
        this.el.setAttribute("class", "radioChoice");
        this.el.setAttribute("className", "radioChoice");
        this.el.setAttribute("value", nextFrameIndex);

        this.parent.choiceArea.insertAdjacentElement("beforeend", this.el);

        this.label = document.createElement("label");
        this.label.setAttribute("for", this.id);
        this.label.insertAdjacentText("beforeend", this.text);
        this.el.insertAdjacentElement("afterend", this.label);

        this.el.addEventListener("change", this.changeHandler.bind(this));
    }

    changeHandler(event) {
        event.preventDefault();
        this.parent.radioHandler(this.nextFrameIndex);
    }
}

//This class pretends to be a frame so that it will trigger when the previous frame attempts to show the next.
class EqualToSwitch {
    constructor(frameIndex, dataIndex, comparison, PI1, PI2, parent) {
        this.frameIndex = frameIndex;
        this.dataIndex = dataIndex;
        this.comparison = comparison;
        this.PI1 = PI1;
        this.PI2 = PI2;
        this.parent = parent;
    }

    addToDoc() {
        var nextFrame = null;
        this.parent.data[this.dataIndex] == this.comparison ? nextFrame = this.parent.frames[this.PI1] : nextFrame = this.parent.frames[this.PI2];
        if (nextFrame != null) nextFrame.addToDoc();
    }
}