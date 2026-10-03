import { useEffect, useState } from "react";

import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import CreateQuiz from "./components/CreateQuiz";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Login from "./components/Login";
import TeacherDashboard from "./components/TeacherDashboard";
import Leaderboard from "./components/Leaderboard";

function App() {
  const [page, setPage] = useState("login");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [selectedQuiz, setSelectedQuiz] =
    useState(null);

  const [quizResult, setQuizResult] =
    useState(null);

  const [quizzes, setQuizzes] =
    useState([]);

  const [results, setResults] =
    useState([]);

  /* =========================================================
     LOAD DATA
     ========================================================= */

  useEffect(() => {
    const savedQuizzes =
      JSON.parse(
        localStorage.getItem(
          "quizStudio_quizzes"
        )
      ) || [];

    const savedResults =
      JSON.parse(
        localStorage.getItem(
          "quizStudio_results"
        )
      ) || [];

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          "quizStudio_currentUser"
        )
      ) || null;

    setQuizzes(savedQuizzes);
    setResults(savedResults);

    if (savedUser) {
      setCurrentUser(savedUser);

      if (
        savedUser.role === "teacher"
      ) {
        setPage(
          "teacher-dashboard"
        );
      } else {
        setPage("dashboard");
      }
    }
  }, []);

  /* =========================================================
     LOGIN
     ========================================================= */

  const handleLogin = (loginData) => {
    setCurrentUser(loginData);

    localStorage.setItem(
      "quizStudio_currentUser",
      JSON.stringify(loginData)
    );

    if (
      loginData.role === "teacher"
    ) {
      setPage(
        "teacher-dashboard"
      );
    } else {
      setPage("dashboard");
    }
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    setCurrentUser(null);

    localStorage.removeItem(
      "quizStudio_currentUser"
    );

    setSelectedQuiz(null);
    setQuizResult(null);

    setPage("login");
  };

  /* =========================================================
     UPDATE STUDENT USER
     ========================================================= */

  const handleUserChange = (
    updatedUser
  ) => {
    if (!currentUser) {
      return;
    }

    const updatedCurrentUser = {
      ...currentUser,

      user: {
        ...(currentUser.user || {}),
        ...updatedUser,
      },
    };

    setCurrentUser(
      updatedCurrentUser
    );

    localStorage.setItem(
      "quizStudio_currentUser",
      JSON.stringify(
        updatedCurrentUser
      )
    );
  };

  /* =========================================================
     CREATE QUIZ
     ========================================================= */

  const handleCreateQuiz = (
    quizData
  ) => {
    if (!currentUser) {
      return;
    }

    const teacherUser =
      currentUser.user ||
      currentUser;

    const newQuiz = {
      ...quizData,

      id:
        quizData.id ||
        `quiz_${Date.now()}`,

      teacherId:
        teacherUser.id ||
        teacherUser.email ||
        "",

      teacherEmail:
        teacherUser.email || "",

      createdAt:
        new Date().toISOString(),
    };

    const updatedQuizzes = [
      ...quizzes,
      newQuiz,
    ];

    setQuizzes(
      updatedQuizzes
    );

    localStorage.setItem(
      "quizStudio_quizzes",
      JSON.stringify(
        updatedQuizzes
      )
    );

    setPage(
      "teacher-dashboard"
    );
  };

  /* =========================================================
     GET CURRENT STUDENT ID
     ========================================================= */

  const getCurrentStudentId = () => {
    const studentUser =
      currentUser?.user ||
      currentUser;

    return (
      studentUser?.id ||
      studentUser?.email ||
      ""
    );
  };

  /* =========================================================
     GET STUDENT ATTEMPTS
     ========================================================= */

  const getQuizAttemptsForStudent = (
    quizId
  ) => {
    const studentId =
      getCurrentStudentId();

    return results.filter(
      (result) =>
        result.quizId === quizId &&
        result.studentId ===
          studentId
    );
  };

  /* =========================================================
     START QUIZ
     ========================================================= */

  const handleStartQuiz = (
    quiz
  ) => {
    if (!quiz) {
      return;
    }

    /*
    Teacher preview does not consume
    student attempts.
    */

    if (
      currentUser?.role ===
      "teacher"
    ) {
      setSelectedQuiz(quiz);
      setPage("quiz");
      return;
    }

    /*
    Student attempt checking.
    */

    if (
      currentUser?.role ===
      "student"
    ) {
      const attemptsUsed =
        getQuizAttemptsForStudent(
          quiz.id
        ).length;

      const maxAttempts =
        Number(
          quiz.maxAttempts || 1
        );

      if (
        attemptsUsed >=
        maxAttempts
      ) {
        alert(
          `You have used all ${maxAttempts} attempt${
            maxAttempts === 1
              ? ""
              : "s"
          } allowed for this quiz.`
        );

        return;
      }
    }

    setSelectedQuiz(quiz);
    setQuizResult(null);
    setPage("quiz");
  };

  /* =========================================================
     SUBMIT QUIZ
     ========================================================= */

  const handleQuizSubmit = (
    answers,
    meta = {}
  ) => {
    if (
      !selectedQuiz ||
      !currentUser
    ) {
      return;
    }

    const studentUser =
      currentUser.user ||
      currentUser;

    const questions =
      selectedQuiz.questions ||
      [];

    /*
    Calculate score.
    */

    let score = 0;

    questions.forEach(
      (
        question,
        index
      ) => {
        const selectedAnswer =
          answers?.[index];

        const correctAnswer =
          question.correctAnswer;

        if (
          selectedAnswer !==
            undefined &&
          selectedAnswer !== null &&
          String(
            selectedAnswer
          ).trim() ===
            String(
              correctAnswer
            ).trim()
        ) {
          score += 1;
        }
      }
    );

    const total =
      questions.length;

    const percentage =
      total > 0
        ? Math.round(
            (score / total) *
              100
          )
        : 0;

    /*
    Create result.
    */

    const newResult = {
      id:
        `result_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      quizId:
        selectedQuiz.id,

      quizTitle:
        selectedQuiz.title,

      studentId:
        studentUser.id ||
        studentUser.email ||
        "",

      studentName:
        studentUser.name ||
        "Student",

      answers:
        answers || {},

      score,

      total,

      totalQuestions:
        total,

      percentage,

      status:
        meta?.status ||
        "completed",

      submittedAt:
        new Date().toISOString(),

      completedAt:
        new Date().toISOString(),
    };

    /*
    Save result.
    */

    const updatedResults = [
      ...results,
      newResult,
    ];

    setResults(
      updatedResults
    );

    localStorage.setItem(
      "quizStudio_results",
      JSON.stringify(
        updatedResults
      )
    );

    /*
    Result page data.
    */

    setQuizResult({
      quiz: selectedQuiz,

      answers:
        answers || {},

      meta: {
        status:
          meta?.status ||
          "completed",

        score,

        total,

        percentage,
      },
    });

    setPage("result");
  };

  /* =========================================================
     VIEW LEADERBOARD
     ========================================================= */

  const handleViewLeaderboard = (
    quiz
  ) => {
    setSelectedQuiz(quiz);
    setPage("leaderboard");
  };

  /* =========================================================
     DELETE QUIZ
     ========================================================= */

  const handleDeleteQuiz = (
    quizId
  ) => {
    const updatedQuizzes =
      quizzes.filter(
        (quiz) =>
          quiz.id !== quizId
      );

    const updatedResults =
      results.filter(
        (result) =>
          result.quizId !==
          quizId
      );

    setQuizzes(
      updatedQuizzes
    );

    setResults(
      updatedResults
    );

    localStorage.setItem(
      "quizStudio_quizzes",
      JSON.stringify(
        updatedQuizzes
      )
    );

    localStorage.setItem(
      "quizStudio_results",
      JSON.stringify(
        updatedResults
      )
    );
  };

  /* =========================================================
     SHARE QUIZ
     ========================================================= */

  const handleShareQuiz = async (
    quiz
  ) => {
    if (!quiz) {
      return;
    }

    try {
      /*
      Convert complete quiz data
      into URL-safe Base64.
      */

      const json =
        JSON.stringify(quiz);

      const bytes =
        new TextEncoder().encode(
          json
        );

      let binary = "";

      bytes.forEach(
        (byte) => {
          binary +=
            String.fromCharCode(
              byte
            );
        }
      );

      const encoded =
        btoa(binary)
          .replace(
            /\+/g,
            "-"
          )
          .replace(
            /\//g,
            "_"
          )
          .replace(
            /=+$/,
            ""
          );

      /*
      Create the actual quiz URL.
      */

      const shareUrl =
        `${window.location.origin}${window.location.pathname}?quiz=${encoded}`;

      /*
      Try to copy automatically.
      */

      let copied = false;

      try {
        await navigator.clipboard.writeText(
          shareUrl
        );

        copied = true;
      } catch (error) {
        console.log(
          "Clipboard access unavailable."
        );
      }

      /*
      Native sharing on supported
      devices/browsers.
      */

      if (
        navigator.share
      ) {
        const shouldShare =
          window.confirm(
            copied
              ? "Quiz link copied successfully.\n\nDo you also want to share it using your device's Share option?"
              : "Would you like to share this quiz using your device's Share option?"
          );

        if (shouldShare) {
          try {
            await navigator.share({
              title:
                quiz.title ||
                "Online Quiz",

              text:
                `Attend this quiz: ${
                  quiz.title ||
                  "Online Quiz"
                }`,

              url: shareUrl,
            });

            return;
          } catch (error) {
            console.log(
              "Native share cancelled."
            );
          }
        }
      }

      /*
      Desktop fallback.
      */

      window.prompt(
        copied
          ? `Quiz link copied successfully.\n\nQuiz: ${quiz.title}\n\nYou can also copy the link below:`
          : `Copy this quiz link for your students:`,
        shareUrl
      );

    } catch (error) {
      console.error(
        "Unable to create quiz link:",
        error
      );

      alert(
        "Unable to create the quiz link. Please try again."
      );
    }
  };

  /* =========================================================
     LOGIN PAGE
     ========================================================= */

  if (
    page === "login"
  ) {
    return (
      <Login
        onLogin={
          handleLogin
        }
      />
    );
  }

  /* =========================================================
     TEACHER DASHBOARD
     ========================================================= */

  if (
    page ===
      "teacher-dashboard" &&
    currentUser?.role ===
      "teacher"
  ) {
    return (
      <>
        <Header
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
        />

        <TeacherDashboard
          quizzes={
            quizzes
          }

          results={
            results
          }

          currentUser={
            currentUser
          }

          onCreateQuiz={() =>
            setPage(
              "create-quiz"
            )
          }

          onViewLeaderboard={
            handleViewLeaderboard
          }

          onDeleteQuiz={
            handleDeleteQuiz
          }

          onShareQuiz={
            handleShareQuiz
          }
        />
      </>
    );
  }

  /* =========================================================
     CREATE QUIZ
     ========================================================= */

  if (
    page === "create-quiz" &&
    currentUser?.role ===
      "teacher"
  ) {
    return (
      <>
        <Header
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
        />

        <CreateQuiz
          onCreateQuiz={
            handleCreateQuiz
          }

          onSave={
            handleCreateQuiz
          }

          onCancel={() =>
            setPage(
              "teacher-dashboard"
            )
          }
        />
      </>
    );
  }

  /* =========================================================
     TEACHER LEADERBOARD
     ========================================================= */

  if (
    page === "leaderboard" &&
    currentUser?.role ===
      "teacher"
  ) {
    return (
      <>
        <Header
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
        />

        <Leaderboard
          quiz={
            selectedQuiz
          }

          results={
            results
          }

          currentUser={
            currentUser
          }

          onBack={() =>
            setPage(
              "teacher-dashboard"
            )
          }
        />
      </>
    );
  }

  /* =========================================================
     STUDENT DASHBOARD
     ========================================================= */

  if (
    page === "dashboard" &&
    currentUser?.role ===
      "student"
  ) {
    const studentUser =
      currentUser.user ||
      currentUser;

    return (
      <>
        <Header
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
        />

        <Dashboard
          role="student"

          user={
            studentUser
          }

          quizzes={
            quizzes
          }

          attempts={
            results
          }

          onUserChange={
            handleUserChange
          }

          onCreate={() =>
            alert(
              "Students cannot create quizzes."
            )
          }

          onStart={
            handleStartQuiz
          }

          onDelete={() => {}}

          onShare={
            handleShareQuiz
          }
        />
      </>
    );
  }

  /* =========================================================
     QUIZ PAGE
     ========================================================= */

  if (
    page === "quiz" &&
    selectedQuiz
  ) {
    return (
      <>
        <Header
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
        />

        <Quiz
          quiz={
            selectedQuiz
          }

          onSubmit={
            handleQuizSubmit
          }

          onCancel={() => {
            setSelectedQuiz(
              null
            );

            setPage(
              "dashboard"
            );
          }}
        />
      </>
    );
  }

  /* =========================================================
     RESULT PAGE
     ========================================================= */

  if (
    page === "result" &&
    quizResult
  ) {
    return (
      <>
        <Header
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
        />

        <Result
          quiz={
            quizResult.quiz
          }

          answers={
            quizResult.answers
          }

          meta={
            quizResult.meta
          }

          onDashboard={() => {
            setQuizResult(
              null
            );

            setSelectedQuiz(
              null
            );

            setPage(
              "dashboard"
            );
          }}

          /*
          Retake goes through
          handleStartQuiz so that
          maxAttempts is checked.
          */

          onRestart={() => {
            if (
              quizResult?.quiz
            ) {
              handleStartQuiz(
                quizResult.quiz
              );
            }
          }}
        />
      </>
    );
  }

  return null;
}

export default App;