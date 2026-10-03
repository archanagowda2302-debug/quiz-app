import React from "react";

function TeacherDashboard({
  quizzes,
  results,
  currentUser,
  onCreateQuiz,
  onViewLeaderboard,
  onDeleteQuiz,
  onShareQuiz,
}) {
  /*
    GET CURRENT TEACHER ID

    Every teacher needs a unique ID.

    We use email first and fall back
    to the user ID.
  */
  const currentTeacherId =
    currentUser?.user?.id ||
    currentUser?.user?.email;

  /*
    ONLY SHOW THIS TEACHER'S QUIZZES
  */
  const teacherQuizzes = quizzes.filter(
    (quiz) =>
      quiz.teacherId === currentTeacherId
  );

  /*
    GET RESULTS FOR A PARTICULAR QUIZ
  */
  const getQuizResults = (quizId) => {
    return results.filter(
      (result) =>
        result.quizId === quizId
    );
  };

  return (
    <div className="teacher-dashboard">

      {/* HEADER */}
      <div className="teacher-dashboard-header">
        <div>
          <span className="dashboard-label">
            TEACHER DASHBOARD
          </span>

          <h1>
            Quiz Management
          </h1>

          <p>
            Create, manage and monitor
            your quizzes.
          </p>
        </div>

        <button
          className="create-quiz-button"
          onClick={onCreateQuiz}
        >
          + Create Quiz
        </button>
      </div>

      {/* STATISTICS */}
      <div className="teacher-stats">

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            Q
          </div>

          <div>
            <span>
              Your Quizzes
            </span>

            <strong>
              {teacherQuizzes.length}
            </strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            S
          </div>

          <div>
            <span>
              Total Attempts
            </span>

            <strong>
              {
                teacherQuizzes.reduce(
                  (total, quiz) =>
                    total +
                    getQuizResults(
                      quiz.id
                    ).length,
                  0
                )
              }
            </strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            L
          </div>

          <div>
            <span>
              Active Quizzes
            </span>

            <strong>
              {
                teacherQuizzes.filter(
                  (quiz) =>
                    quiz.status !==
                    "inactive"
                ).length
              }
            </strong>
          </div>
        </div>

      </div>

      {/* QUIZ SECTION */}
      <div className="teacher-quiz-section">

        <div className="section-heading">
          <div>
            <h2>
              Your Quizzes
            </h2>

            <p>
              Only quizzes created by your
              teacher account are shown here.
            </p>
          </div>
        </div>

        {teacherQuizzes.length === 0 ? (

          <div className="empty-quiz-state">

            <div className="empty-quiz-icon">
              Q
            </div>

            <h3>
              No quizzes created yet
            </h3>

            <p>
              Create your first quiz to
              start assessing students.
            </p>

            <button
              onClick={onCreateQuiz}
              className="create-quiz-button"
            >
              Create your first quiz
            </button>

          </div>

        ) : (

          <div className="teacher-quiz-grid">

            {teacherQuizzes.map(
              (quiz) => {

                const quizResults =
                  getQuizResults(
                    quiz.id
                  );

                return (

                  <div
                    className="teacher-quiz-card"
                    key={quiz.id}
                  >

                    <div className="quiz-card-top">

                      <div className="quiz-card-icon">
                        Q
                      </div>

                      <span className="quiz-status">
                        Active
                      </span>

                    </div>

                    <h3>
                      {quiz.title}
                    </h3>

                    <p className="quiz-description">
                      {quiz.description ||
                        "Quiz assessment"}
                    </p>

                    <div className="quiz-card-info">

                      <span>
                        {quiz.questions?.length ||
                          quiz.questionCount ||
                          0}{" "}
                        Questions
                      </span>

                      <span>
                        {quizResults.length}{" "}
                        Attempts
                      </span>

                    </div>

                    <div className="quiz-card-actions">

                      <button
                        className="leaderboard-button"
                        onClick={() =>
                          onViewLeaderboard(
                            quiz
                          )
                        }
                      >
                        View Leaderboard
                      </button>

                      {/* SHARE QUIZ LINK */}
                      <button
                        className="share-quiz-button"
                        onClick={() =>
                          onShareQuiz(quiz)
                        }
                      >
                        Share Quiz Link
                      </button>

                      <button
                        className="delete-quiz-button"
                        onClick={() => {

                          const confirmDelete =
                            window.confirm(
                              "Are you sure you want to delete this quiz?"
                            );

                          if (
                            confirmDelete
                          ) {
                            onDeleteQuiz(
                              quiz.id
                            );
                          }

                        }}
                      >
                        Delete
                      </button>

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

export default TeacherDashboard;