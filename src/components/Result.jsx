import React from "react";

function Result({
  quiz,
  answers,
  meta,
  onDashboard,
  onRestart,
}) {
  /*
   * Safety check.
   */
  if (!quiz) {
    return (
      <div className="result-page">
        <div className="result-container">
          <div className="empty-state">
            <h2>
              Result not available
            </h2>

            <button
              type="button"
              className="primary-button"
              onClick={onDashboard}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions =
    quiz.questions || [];

  /*
   * Score comes from App.jsx when available.
   *
   * If it isn't available, calculate it here
   * using the original question index.
   */
  const calculatedScore =
    questions.reduce(
      (total, question, index) => {
        const userAnswer =
          answers?.[index];

        return (
          total +
          (userAnswer ===
          question.correctAnswer
            ? 1
            : 0)
        );
      },
      0
    );

  const score =
    meta?.score ??
    calculatedScore;

  const total =
    meta?.total ??
    questions.length;

  const percentage =
    meta?.percentage ??
    (total
      ? Math.round(
          (score / total) * 100
        )
      : 0);

  const statusText =
    meta?.status === "time-up"
      ? "Time expired"
      : meta?.status ===
        "tab-switch"
      ? "Quiz closed: tab switch detected"
      : "Quiz completed";

  return (
    <div className="result-page">
      <div className="result-container">

        <div className="result-hero">

          <div className="result-icon">
            {percentage >= 50
              ? "✓"
              : "!"}
          </div>

          <div className="result-category">
            {statusText.toUpperCase()}
          </div>

          <h1>
            {quiz.title}
          </h1>

          <p>
            Your score and answer review
            are shown below.
          </p>

          <div className="score-circle">
            <strong>
              {score}
            </strong>

            <span>
              / {total}
            </span>
          </div>

          <div className="percentage">
            {percentage}%
          </div>
        </div>

        <div className="result-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={onDashboard}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onRestart}
          >
            Retake Quiz ↻
          </button>

        </div>

        <div className="review-header">

          <div>
            <h2>
              Answer Review
            </h2>

            <p>
              Review every response after
              your attempt.
            </p>
          </div>

          <div className="review-summary">

            <span className="correct-summary">
              ✓ {score} Correct
            </span>

            <span className="wrong-summary">
              ✕{" "}
              {Math.max(
                0,
                total - score
              )}{" "}
              Wrong
            </span>

          </div>
        </div>

        <div className="review-list">

          {questions.map(
            (question, index) => {
              /*
               * IMPORTANT:
               *
               * Quiz.jsx stores answers using
               * question.originalIndex.
               *
               * Since Result receives the
               * original quiz.questions array,
               * the original index is simply
               * the current index here.
               */
              const userAnswer =
                answers?.[index] ||
                "Not answered";

              const correctAnswer =
                question.correctAnswer;

              const isCorrect =
                userAnswer ===
                correctAnswer;

              const userIndex =
                userAnswer !==
                "Not answered"
                  ? userAnswer.charCodeAt(
                      0
                    ) - 65
                  : -1;

              const correctIndex =
                typeof correctAnswer ===
                "string"
                  ? correctAnswer.charCodeAt(
                      0
                    ) - 65
                  : -1;

              const userOptionText =
                userIndex >= 0 &&
                userIndex <
                  (
                    question.options ||
                    []
                  ).length
                  ? question.options[
                      userIndex
                    ]
                  : "Not answered";

              const correctOptionText =
                correctIndex >= 0 &&
                correctIndex <
                  (
                    question.options ||
                    []
                  ).length
                  ? question.options[
                      correctIndex
                    ]
                  : "Not available";

              return (
                <div
                  className={`review-card ${
                    isCorrect
                      ? "review-correct"
                      : "review-wrong"
                  }`}
                  key={index}
                >

                  <div className="review-card-top">

                    <span className="review-number">
                      Q{index + 1} ·{" "}
                      {question.section ||
                        "General"}
                    </span>

                    <span
                      className={`review-status ${
                        isCorrect
                          ? "status-correct"
                          : "status-wrong"
                      }`}
                    >
                      {isCorrect
                        ? "✓ Correct"
                        : "✕ Incorrect"}
                    </span>

                  </div>

                  <h3>
                    {question.question}
                  </h3>

                  <div className="answer-review">

                    <div
                      className={`answer-row ${
                        isCorrect
                          ? "your-answer-correct"
                          : "your-answer-wrong"
                      }`}
                    >

                      <span className="answer-label">
                        Your Answer
                      </span>

                      <span className="answer-value">
                        {userAnswer ===
                        "Not answered"
                          ? "Not answered"
                          : `${userAnswer}. ${userOptionText}`}
                      </span>

                    </div>

                    <div className="answer-row correct-answer-row">

                      <span className="answer-label">
                        Correct Answer
                      </span>

                      <span className="answer-value">
                        {correctAnswer}.{" "}
                        {correctOptionText}
                      </span>

                    </div>

                  </div>
                </div>
              );
            }
          )}

        </div>
      </div>
    </div>
  );
}

export default Result;