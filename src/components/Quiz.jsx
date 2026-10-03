import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Fisher-Yates shuffle.
 */
function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/*
 * Prepare quiz.
 *
 * Questions can be shuffled.
 * Options can also be shuffled.
 *
 * IMPORTANT:
 * We keep the original option letter
 * so the correct answer remains correct.
 */
function prepareQuestions(quiz) {
  let questions = (quiz.questions || []).map(
    (question, originalIndex) => {
      const options = (question.options || []).map(
        (text, index) => ({
          text,
          letter: String.fromCharCode(65 + index),
        })
      );

      const randomizedOptions = quiz.shuffleOptions
        ? shuffle(options)
        : options;

      return {
        ...question,
        originalIndex,
        displayOptions: randomizedOptions,
      };
    }
  );

  if (quiz.shuffleQuestions) {
    questions = shuffle(questions);
  }

  return questions;
}

function Quiz({
  quiz,
  onSubmit,
  onCancel,

  // These are also supported so the component
  // remains compatible with the older prop names.
  onFinish,
  onExit,
}) {
  /*
   * Support both:
   * onSubmit / onCancel
   * and
   * onFinish / onExit
   */
  const submitCallback = onSubmit || onFinish;
  const exitCallback = onCancel || onExit;

  /*
   * Prepare questions only once.
   * This prevents questions from reshuffling
   * every time the component renders.
   */
  const [questions] = useState(() =>
    prepareQuestions(quiz)
  );

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  /*
   * Answers are stored against the original
   * question indexes.
   */
  const [answers, setAnswers] = useState({});

  const [secondsLeft, setSecondsLeft] = useState(
    () => Number(quiz.durationMinutes || 10) * 60
  );

  const [tabWarning, setTabWarning] = useState(false);

  /*
   * Prevent multiple submissions.
   */
  const submittedRef = useRef(false);

  /*
   * Keep a reference to the timeout used when
   * the user switches tabs.
   */
  const tabSubmitTimeoutRef = useRef(null);

  const question = questions[currentQuestion];

  const answeredCount = Object.keys(answers).length;

  const sections = useMemo(
    () => [
      ...new Set(
        questions.map(
          (q) => q.section || "General"
        )
      ),
    ],
    [questions]
  );

  /*
   * Submit the quiz only once.
   */
  const submit = (status = "completed") => {
    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;

    if (tabSubmitTimeoutRef.current) {
      clearTimeout(tabSubmitTimeoutRef.current);
      tabSubmitTimeoutRef.current = null;
    }

    if (typeof submitCallback === "function") {
      submitCallback(answers, {
        status,
      });
    } else {
      console.error(
        "Quiz: No submit callback was provided."
      );
    }
  };

  /*
   * Countdown timer.
   */
  useEffect(() => {
    if (submittedRef.current) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /*
   * Automatically submit when timer reaches zero.
   */
  useEffect(() => {
    if (
      secondsLeft <= 0 &&
      !submittedRef.current
    ) {
      submit("time-up");
    }
  }, [secondsLeft]);

  /*
   * Detect tab switching.
   *
   * When the user leaves the quiz tab/window,
   * the quiz is submitted automatically.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        !submittedRef.current
      ) {
        setTabWarning(true);

        /*
         * Small delay gives React time to update
         * the warning before the quiz is submitted.
         */
        tabSubmitTimeoutRef.current = setTimeout(() => {
          submit("tab-switch");
        }, 250);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (tabSubmitTimeoutRef.current) {
        clearTimeout(tabSubmitTimeoutRef.current);
      }
    };
  }, []);

  /*
   * Select an answer.
   */
  const selectAnswer = (letter) => {
    if (submittedRef.current) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [question.originalIndex]: letter,
    }));
  };

  /*
   * Format timer as MM:SS.
   */
  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes = Math.floor(
      safeSeconds / 60
    );

    const remainingSeconds =
      safeSeconds % 60;

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${String(remainingSeconds).padStart(
        2,
        "0"
      )}`
    );
  };

  /*
   * Go to next question.
   */
  const nextQuestion = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (value) => value + 1
      );
    }
  };

  /*
   * Go to previous question.
   */
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (value) => value - 1
      );
    }
  };

  /*
   * Exit quiz.
   */
  const handleExit = () => {
    if (submittedRef.current) {
      return;
    }

    const shouldExit = window.confirm(
      "Exit this quiz? It will not be submitted."
    );

    if (!shouldExit) {
      return;
    }

    if (typeof exitCallback === "function") {
      exitCallback();
    }
  };

  /*
   * No questions available.
   */
  if (!question) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="empty-state">
            <h2>No questions available</h2>

            <button
              type="button"
              className="primary-button"
              onClick={exitCallback}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">

        {tabWarning && (
          <div className="security-warning">
            Quiz closed because you switched away
            from the quiz tab.
          </div>
        )}

        <div className="quiz-topbar">

          <button
            type="button"
            className="back-button"
            onClick={handleExit}
            disabled={submittedRef.current}
          >
            ← Exit Quiz
          </button>

          <div
            className={`timer-pill ${
              secondsLeft <= 60
                ? "timer-danger"
                : ""
            }`}
          >
            {formatTime(secondsLeft)}
          </div>

          <div className="progress-info">
            {answeredCount}/{questions.length}{" "}
            answered
          </div>
        </div>

        <div className="quiz-progress">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        <div className="section-tabs">
          {sections.map((section) => (
            <span
              className={
                question.section === section
                  ? "section-tab active"
                  : "section-tab"
              }
              key={section}
            >
              {section} ·{" "}
              {
                questions.filter(
                  (q) =>
                    (q.section ||
                      "General") === section
                ).length
              }
            </span>
          ))}
        </div>

        <div className="quiz-header">
          <div className="quiz-category">
            {question.section || "QUIZ"}
          </div>

          <h1>{quiz.title}</h1>

          <p>
            Choose the answer you think is
            correct. Leaving this tab ends
            the attempt.
          </p>
        </div>

        <div className="question-card">
          <div className="question-label">
            QUESTION {currentQuestion + 1} /{" "}
            {questions.length}
          </div>

          <h2>{question.question}</h2>

          <div className="quiz-options">
            {question.displayOptions.map(
              (option, index) => {
                const selected =
                  answers[
                    question.originalIndex
                  ] === option.letter;

                return (
                  <button
                    type="button"
                    key={`${option.letter}-${index}`}
                    className={`quiz-option ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectAnswer(
                        option.letter
                      )
                    }
                    disabled={
                      submittedRef.current
                    }
                  >
                    <span className="option-letter">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span className="option-text">
                      {option.text}
                    </span>

                    <span className="option-check">
                      {selected ? "✓" : ""}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="quiz-navigation">

          <button
            type="button"
            className="secondary-button"
            onClick={previousQuestion}
            disabled={
              currentQuestion === 0 ||
              submittedRef.current
            }
          >
            ← Previous
          </button>

          {currentQuestion <
          questions.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={nextQuestion}
              disabled={submittedRef.current}
            >
              Next Question →
            </button>
          ) : (
            <button
              type="button"
              className="submit-button"
              onClick={() => {
                if (submittedRef.current) {
                  return;
                }

                if (
                  answeredCount !==
                    questions.length
                ) {
                  const unanswered =
                    questions.length -
                    answeredCount;

                  const shouldSubmit =
                    window.confirm(
                      `${unanswered} question(s) unanswered. Submit anyway?`
                    );

                  if (!shouldSubmit) {
                    return;
                  }
                }

                submit("completed");
              }}
              disabled={submittedRef.current}
            >
              Submit Quiz ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;