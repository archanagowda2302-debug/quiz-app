
import { useState } from "react";

function TakeQuiz({ quiz, onFinish, onExit }) {
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const question =
    quiz.questions[currentQuestion];

  const selectAnswer = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (
      currentQuestion <
      quiz.questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );
    }
  };

  const submitQuiz = () => {
    const score = quiz.questions.reduce(
      (total, item, index) => {
        if (
          answers[index] ===
          item.correctAnswer
        ) {
          return total + 1;
        }

        return total;
      },
      0
    );

    onFinish({
      answers: answers,
      score: score,
      total: quiz.questions.length
    });
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif"
      }}
    >

      <button onClick={onExit}>
        ← Exit Quiz
      </button>

      <h1>{quiz.title}</h1>

      <p>
        Question {currentQuestion + 1} of{" "}
        {quiz.questions.length}
      </p>

      <hr />

      <h2>
        {question.question}
      </h2>

      <div>
        {question.options.map(
          (option, index) => (

            <button
              key={index}
              onClick={() =>
                selectAnswer(index)
              }
              style={{
                display: "block",
                width: "100%",
                padding: "15px",
                margin: "10px 0",
                textAlign: "left",
                cursor: "pointer",
                border:
                  answers[currentQuestion] ===
                  index
                    ? "3px solid #333"
                    : "1px solid #ddd"
              }}
            >
              {String.fromCharCode(
                65 + index
              )}. {option}
            </button>

          )
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px"
        }}
      >

        <button
          onClick={previousQuestion}
          disabled={
            currentQuestion === 0
          }
        >
          ← Previous
        </button>

        {currentQuestion ===
        quiz.questions.length - 1 ? (

          <button
            onClick={submitQuiz}
          >
            Submit Quiz
          </button>

        ) : (

          <button
            onClick={nextQuestion}
          >
            Next →
          </button>

        )}

      </div>

    </div>
  );
}

export default TakeQuiz;

