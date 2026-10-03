import React from "react";

function Leaderboard({
  quiz,
  results,
  currentUser,
  onBack,
}) {
  if (!quiz) {
    return null;
  }

  /*
  =========================================================
  ONLY RESULTS FOR THIS QUIZ
  =========================================================
  */

  const quizResults = results.filter(
    (result) =>
      result.quizId === quiz.id
  );

  /*
  =========================================================
  TOTAL QUESTIONS
  =========================================================
  */

  const totalQuestions =
    quiz.questions?.length ||
    quiz.questionCount ||
    quizResults[0]?.total ||
    0;

  /*
  =========================================================
  KEEP ONLY THE LATEST ATTEMPT
  FOR EACH STUDENT
  =========================================================
  */

  const latestByStudent = {};

  quizResults.forEach((result) => {
    /*
      Use student ID as the unique key.

      If student ID is missing, use email.
      If both are missing, use student name.
    */

    const studentKey =
      result.studentId ||
      result.studentEmail ||
      result.studentName ||
      result.id;

    const existing =
      latestByStudent[studentKey];

    /*
      If there is no previous attempt,
      store this one.
    */

    if (!existing) {
      latestByStudent[studentKey] =
        result;

      return;
    }

    /*
      Compare completion dates.

      The newest attempt is kept.
    */

    const existingDate =
      new Date(
        existing.completedAt ||
          existing.submittedAt ||
          0
      ).getTime();

    const currentDate =
      new Date(
        result.completedAt ||
          result.submittedAt ||
          0
      ).getTime();

    if (currentDate >= existingDate) {
      latestByStudent[studentKey] =
        result;
    }
  });

  /*
  =========================================================
  UNIQUE STUDENT LEADERBOARD
  =========================================================
  */

  const leaderboard =
    Object.values(
      latestByStudent
    ).sort((a, b) => {
      const percentageA =
        Number(a.percentage) ||
        0;

      const percentageB =
        Number(b.percentage) ||
        0;

      /*
        First compare percentage.
      */

      if (
        percentageB !==
        percentageA
      ) {
        return (
          percentageB -
          percentageA
        );
      }

      /*
        If percentage is same,
        compare raw score.
      */

      const scoreA =
        Number(a.score) || 0;

      const scoreB =
        Number(b.score) || 0;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      /*
        If score is also same,
        latest submission first.
      */

      return (
        new Date(
          b.completedAt ||
            b.submittedAt ||
            0
        ).getTime() -
        new Date(
          a.completedAt ||
            a.submittedAt ||
            0
        ).getTime()
      );
    });

  /*
  =========================================================
  AVERAGE SCORE
  =========================================================

  Average is calculated from the latest attempt
  of each student, not from duplicate attempts.
  */

  const averageScore =
    leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce(
            (sum, result) =>
              sum +
              Number(
                result.percentage || 0
              ),
            0
          ) /
            leaderboard.length
        )
      : 0;

  return (
    <div className="leaderboard-page">

      {/* PAGE HEADER */}

      <div className="leaderboard-header">

        <button
          type="button"
          className="leaderboard-back-button"
          onClick={onBack}
        >
          ← Back to quizzes
        </button>

        <div className="leaderboard-title-area">

          <span className="dashboard-label">
            QUIZ LEADERBOARD
          </span>

          <h1>
            {quiz.title}
          </h1>

          <p>
            Student rankings and performance
            for this quiz.
          </p>

        </div>

      </div>

      {/* QUIZ SUMMARY */}

      <div className="leaderboard-summary">

        <div className="leaderboard-summary-card">

          <span>
            Questions
          </span>

          <strong>
            {totalQuestions}
          </strong>

        </div>

        <div className="leaderboard-summary-card">

          <span>
            Attempts
          </span>

          <strong>
            {quizResults.length}
          </strong>

        </div>

        <div className="leaderboard-summary-card">

          <span>
            Students
          </span>

          <strong>
            {leaderboard.length}
          </strong>

        </div>

        <div className="leaderboard-summary-card">

          <span>
            Average Score
          </span>

          <strong>
            {averageScore}%
          </strong>

        </div>

      </div>

      {/* LEADERBOARD */}

      <div className="leaderboard-container">

        <div className="leaderboard-container-header">

          <div>

            <h2>
              Student Rankings
            </h2>

            <p>
              Students are ranked according
              to their quiz score.
            </p>

          </div>

          <div className="leaderboard-count">

            {leaderboard.length}{" "}

            {leaderboard.length === 1
              ? "Student"
              : "Students"}

          </div>

        </div>

        {leaderboard.length === 0 ? (

          <div className="leaderboard-empty">

            <div className="empty-leaderboard-icon">
              L
            </div>

            <h3>
              No attempts yet
            </h3>

            <p>
              Students who complete this
              quiz will appear here.
            </p>

          </div>

        ) : (

          <div className="ranking-list">

            {leaderboard.map(
              (result, index) => {

                const score =
                  Number(
                    result.score
                  ) || 0;

                const total =
                  Number(
                    result.total
                  ) ||
                  totalQuestions ||
                  0;

                const percentage =
                  Number(
                    result.percentage
                  ) ||
                  (
                    total > 0
                      ? Math.round(
                          (score /
                            total) *
                            100
                        )
                      : 0
                  );

                return (
                  <div
                    className={
                      index === 0
                        ? "ranking-row first-place"
                        : "ranking-row"
                    }
                    key={
                      result.studentId ||
                      result.studentEmail ||
                      result.studentName ||
                      result.id
                    }
                  >

                    {/* RANK */}

                    <div className="rank-number">
                      {index + 1}
                    </div>

                    {/* STUDENT */}

                    <div className="student-ranking-info">

                      <div className="student-avatar">

                        {(
                          result.studentName ||
                          "S"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <strong>
                          {result.studentName ||
                            "Student"}
                        </strong>

                        <span>
                          Student ID:{" "}
                          {result.studentId ||
                            "N/A"}
                        </span>

                      </div>

                    </div>

                    {/* SCORE */}

                    <div className="ranking-score">

                      <strong>
                        {score}/{total}
                      </strong>

                      <span>
                        Score
                      </span>

                    </div>

                    {/* PERCENTAGE */}

                    <div className="ranking-percentage">

                      <strong>
                        {percentage}%
                      </strong>

                      <div className="score-progress">

                        <div
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Leaderboard;