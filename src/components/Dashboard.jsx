import React, {
  useMemo,
  useState,
} from "react";

/* =========================================================
   DECODE TEACHER SHARED QUIZ LINK
   ========================================================= */

function decodeQuiz(value) {
  try {
    const url = new URL(value.trim());

    const encoded = url.searchParams.get("quiz");

    if (!encoded) {
      return null;
    }

    const padded = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        Math.ceil(encoded.length / 4) * 4,
        "="
      );

    const binary = atob(padded);

    const bytes = Uint8Array.from(
      binary,
      (char) => char.charCodeAt(0)
    );

    return JSON.parse(
      new TextDecoder().decode(bytes)
    );
  } catch {
    return null;
  }
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  role,
  user,
  quizzes = [],
  attempts = [],
  onUserChange,
  onCreate,
  onStart,
  onDelete,
  onShare,
}) {
  const [quizLink, setQuizLink] = useState("");

  /*
    IMPORTANT FIX

    Student login can temporarily render Dashboard
    before the user object is available.

    Instead of directly using:
      user.id
      user.name

    we use a safe user object.
  */

  const safeUser = user || {
    id: "",
    name: "",
  };

  /* =========================================================
     JOIN QUIZ
     ========================================================= */

  const joinQuiz = () => {
    const link = quizLink.trim();

    if (!link) {
      alert(
        "Please paste the quiz link shared by your teacher."
      );

      return;
    }

    const quiz = decodeQuiz(link);

    if (!quiz) {
      alert(
        "Invalid quiz link. Please copy the complete link sent by your teacher."
      );

      return;
    }

    if (
      !quiz.questions ||
      !Array.isArray(quiz.questions) ||
      quiz.questions.length === 0
    ) {
      alert(
        "This quiz link does not contain any questions."
      );

      return;
    }

    onStart({
      ...quiz,

      id:
        quiz.id ||
        `shared-${
          quiz.title || "quiz"
        }`,
    });
  };

  /* =========================================================
     STUDENT ATTEMPTS
     ========================================================= */

  const myAttempts = useMemo(
    () =>
      attempts.filter(
        (attempt) =>
          attempt &&
          attempt.studentId === safeUser.id
      ),
    [attempts, safeUser.id]
  );

  /* =========================================================
     TEACHER DASHBOARD
     ========================================================= */

  if (role === "teacher") {
    return (
      <div className="dashboard-page">

        <div className="dashboard-container">

          {/* HERO */}

          <div className="hero-section">

            <div>

              <div className="eyebrow">
                TEACHER DASHBOARD
              </div>

              <h1>
                Create. Share. Track.
              </h1>

              <p>
                Create quizzes, generate
                student links, set timers
                and attempt limits, and
                monitor results.
              </p>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="action-grid">

            <button
              type="button"
              className="action-card create-action"
              onClick={onCreate}
            >

              <div className="action-icon">
                +
              </div>

              <div>

                <h2>
                  Create Quiz
                </h2>

                <p>
                  Build sections, questions,
                  timer and attempt rules.
                </p>

              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            <div className="action-card attend-action">

              <div className="action-icon">
                *
              </div>

              <div>

                <h2>
                  Quiz Leaderboards
                </h2>

                <p>
                  Each quiz has its own
                  separate leaderboard.
                </p>

              </div>

            </div>

          </div>

          {/* QUIZZES */}

          <div className="section-header">

            <div>

              <h2>
                Your Quizzes
              </h2>

              <p>
                Share a quiz using a
                self-contained link.
              </p>

            </div>

            <span className="quiz-count">
              {quizzes.length} Quiz
              {quizzes.length !== 1
                ? "zes"
                : ""}
            </span>

          </div>

          {quizzes.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                Quiz
              </div>

              <h3>
                No quizzes yet
              </h3>

              <p>
                Create your first
                teacher quiz.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={onCreate}
              >
                + Create Quiz
              </button>

            </div>

          ) : (

            <div className="quiz-grid">

              {quizzes.map(
                (quiz, index) => (

                  <div
                    className="quiz-card"
                    key={
                      quiz.id ||
                      `quiz-${index}`
                    }
                  >

                    <div className="quiz-card-top">

                      <span className="quiz-number">
                        #{index + 1}
                      </span>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => {

                          if (
                            window.confirm(
                              "Delete this quiz?"
                            )
                          ) {
                            onDelete(
                              quiz.id
                            );
                          }

                        }}
                      >
                        Delete
                      </button>

                    </div>

                    <h3>
                      {quiz.title}
                    </h3>

                    <p>
                      {quiz.sections
                        ?.length || 1}{" "}
                      section
                      {(quiz.sections
                        ?.length || 1) !== 1
                        ? "s"
                        : ""}
                      {" · "}
                      {quiz.questions
                        ?.length || 0}{" "}
                      questions
                    </p>

                    <div className="quiz-meta-row">

                      <span>
                        Timer:{" "}
                        {quiz.durationMinutes ||
                          0}{" "}
                        min
                      </span>

                      <span>
                        Attempts:{" "}
                        {quiz.maxAttempts ||
                          1}
                      </span>

                    </div>

                    <div className="card-actions">

                      <button
                        type="button"
                        className="start-button"
                        onClick={() =>
                          onShare(quiz)
                        }
                      >
                        Share Link
                      </button>

                      <button
                        type="button"
                        className="secondary-mini"
                        onClick={() =>
                          onStart(quiz)
                        }
                      >
                        Preview →
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* =================================================
              SEPARATE LEADERBOARD FOR EACH QUIZ
             ================================================= */}

          <div className="section-header leaderboard-title">

            <div>

              <h2>
                Quiz Leaderboards
              </h2>

              <p>
                Student rankings are shown
                separately for each quiz.
              </p>

            </div>

          </div>

          <div className="quiz-leaderboards">

            {quizzes.length === 0 ? (

              <div className="empty-inline">
                Create a quiz to view its
                leaderboard.
              </div>

            ) : (

              quizzes.map((quiz) => {

                /*
                  Get attempts belonging only
                  to this quiz.
                */

                const quizAttempts =
                  attempts.filter(
                    (attempt) =>
                      attempt &&
                      attempt.quizId ===
                        quiz.id
                  );

                /*
                  Keep the latest attempt
                  for each student.
                */

                const latestByStudent = {};

                quizAttempts.forEach(
                  (attempt) => {

                    if (!attempt) {
                      return;
                    }

                    const studentKey =
                      attempt.studentId ||
                      attempt.studentName ||
                      attempt.id;

                    const existing =
                      latestByStudent[
                        studentKey
                      ];

                    if (
                      !existing ||
                      new Date(
                        attempt.completedAt || 0
                      ) >
                        new Date(
                          existing.completedAt || 0
                        )
                    ) {
                      latestByStudent[
                        studentKey
                      ] = attempt;
                    }

                  }
                );

                /*
                  Sort students by score.
                */

                const quizLeaderboard =
                  Object.values(
                    latestByStudent
                  ).sort(
                    (a, b) =>
                      Number(
                        b.percentage || 0
                      ) -
                        Number(
                          a.percentage || 0
                        ) ||
                      Number(
                        b.score || 0
                      ) -
                        Number(
                          a.score || 0
                        )
                  );

                return (

                  <div
                    className="quiz-leaderboard-card"
                    key={quiz.id}
                  >

                    <div className="quiz-leaderboard-header">

                      <div>

                        <div className="eyebrow">
                          QUIZ LEADERBOARD
                        </div>

                        <h3>
                          {quiz.title}
                        </h3>

                        <p>
                          {quiz.questions
                            ?.length || 0}{" "}
                          questions
                          {" · "}
                          {quizAttempts.length}{" "}
                          attempt
                          {quizAttempts.length !==
                          1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                      <div className="quiz-leaderboard-info">
                        {
                          quizLeaderboard.length
                        }{" "}
                        student
                        {quizLeaderboard.length !==
                        1
                          ? "s"
                          : ""}
                      </div>

                    </div>

                    {quizLeaderboard.length ===
                    0 ? (

                      <div className="empty-inline">
                        No students have completed
                        this quiz yet.
                      </div>

                    ) : (

                      <div className="leaderboard-card">

                        {quizLeaderboard.map(
                          (
                            entry,
                            index
                          ) => (

                            <div
                              className="leaderboard-row"
                              key={
                                entry.id ||
                                `${quiz.id}-${entry.studentId}-${index}`
                              }
                            >

                              <span className="rank">
                                {index + 1}
                              </span>

                              <div className="leader-student">

                                <strong>
                                  {
                                    entry.studentName ||
                                    "Student"
                                  }
                                </strong>

                                <small>
                                  Student ID:{" "}
                                  {
                                    entry.studentId ||
                                    "N/A"
                                  }
                                </small>

                              </div>

                              <span className="leader-score">
                                {entry.score || 0}/
                                {entry.total || 0}
                              </span>

                              <span className="leader-percent">
                                {
                                  entry.percentage ||
                                  0
                                }%
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                );

              })

            )}

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     STUDENT DASHBOARD
     ========================================================= */

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* HERO */}

        <div className="hero-section">

          <div>

            <div className="eyebrow">
              STUDENT DASHBOARD
            </div>

            <h1>
              Learn. Test. Improve.
            </h1>

            <p>
              Join teacher-shared quizzes,
              complete them within the timer,
              and keep track of your attempts.
            </p>

          </div>

        </div>

        {/* STUDENT DETAILS */}

        <div className="student-form">

          <div className="input-group">

            <label>
              Student Name
            </label>

            <input
              value={safeUser.name}
              onChange={(e) =>
                onUserChange &&
                onUserChange({
                  ...safeUser,
                  name: e.target.value,
                })
              }
              placeholder="Enter your name"
            />

          </div>

          <div className="input-group">

            <label>
              Student ID
            </label>

            <input
              value={safeUser.id}
              onChange={(e) =>
                onUserChange &&
                onUserChange({
                  ...safeUser,
                  id: e.target.value,
                })
              }
              placeholder="Enter your student ID"
            />

          </div>

        </div>

        {/* JOIN QUIZ */}

        <div className="join-quiz-card">

          <div className="join-quiz-icon">
            Link
          </div>

          <div className="join-quiz-content">

            <div className="eyebrow">
              JOIN A QUIZ
            </div>

            <h2>
              Enter Quiz Link
            </h2>

            <p>
              Paste the complete quiz link
              sent by your teacher.
            </p>

            <div className="join-quiz-input">

              <input
                type="text"
                value={quizLink}
                onChange={(e) =>
                  setQuizLink(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter"
                  ) {
                    joinQuiz();
                  }

                }}
                placeholder="Paste quiz link here..."
              />

              <button
                type="button"
                className="primary-button"
                onClick={joinQuiz}
              >
                Join Quiz →
              </button>

            </div>

          </div>

        </div>

        {/* STUDENT ACTIONS */}

        <div className="action-grid">

          <div className="action-card attend-action">

            <div className="action-icon">
              Play
            </div>

            <div>

              <h2>
                Attend Quiz
              </h2>

              <p>
                Paste your teacher's quiz
                link above to begin.
              </p>

            </div>

            <span className="action-arrow">
              ↑
            </span>

          </div>

          <div className="action-card create-action">

            <div className="action-icon">
              Link
            </div>

            <div>

              <h2>
                Teacher Shared Link
              </h2>

              <p>
                A quiz link contains all
                quiz information needed
                to start the test.
              </p>

            </div>

          </div>

        </div>

        {/* AVAILABLE QUIZZES */}

        <div className="section-header">

          <div>

            <h2>
              Available Quizzes
            </h2>

            <p>
              Quizzes stored on this
              browser.
            </p>

          </div>

          <span className="quiz-count">
            {quizzes.length}
          </span>

        </div>

        {quizzes.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              Link
            </div>

            <h3>
              Waiting for a quiz
            </h3>

            <p>
              Ask your teacher to send
              the quiz link.
            </p>

          </div>

        ) : (

          <div className="quiz-grid">

            {quizzes.map(
              (quiz, index) => {

                const used =
                  attempts.filter(
                    (a) =>
                      a &&
                      a.quizId ===
                        quiz.id &&
                      a.studentId ===
                        safeUser.id
                  ).length;

                const remaining =
                  Math.max(
                    0,
                    Number(
                      quiz.maxAttempts ||
                        1
                    ) - used
                  );

                return (

                  <div
                    className="quiz-card"
                    key={
                      quiz.id ||
                      `student-quiz-${index}`
                    }
                  >

                    <div className="quiz-card-top">

                      <span className="quiz-number">
                        #{index + 1}
                      </span>

                      <span className="attempt-badge">
                        {remaining} left
                      </span>

                    </div>

                    <h3>
                      {quiz.title}
                    </h3>

                    <p>
                      {quiz.questions
                        ?.length || 0}{" "}
                      questions ·{" "}
                      {quiz.durationMinutes ||
                        0}{" "}
                      min
                    </p>

                    <div className="quiz-meta-row">

                      <span>
                        Parts:{" "}
                        {quiz.sections
                          ?.length || 1}
                      </span>

                      <span>
                        Attempts: {used}/
                        {quiz.maxAttempts ||
                          1}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="start-button"
                      disabled={
                        !remaining
                      }
                      onClick={() =>
                        onStart(quiz)
                      }
                    >
                      {remaining
                        ? "Attend Quiz →"
                        : "Attempts Used"}
                    </button>

                  </div>

                );
              }
            )}

          </div>

        )}

        {/* STUDENT STATS */}

        <div className="student-stats">

          <div>

            <strong>
              {myAttempts.length}
            </strong>

            <span>
              My Attempts
            </span>

          </div>

          <div>

            <strong>

              {myAttempts.length
                ? Math.round(
                    myAttempts.reduce(
                      (
                        sum,
                        attempt
                      ) =>
                        sum +
                        Number(
                          attempt.percentage ||
                            0
                        ),
                      0
                    ) /
                      myAttempts.length
                  )
                : 0}
              %

            </strong>

            <span>
              Average Score
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;