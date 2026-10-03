import React, {
  useMemo,
  useState,
} from "react";

const blankQuestion = (
  section = "General"
) => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "A",
  section,
});

function CreateQuiz({
  onSave,
  onCreateQuiz,
  onCancel,
}) {
  const [title, setTitle] =
    useState("");

  const [durationMinutes, setDurationMinutes] =
    useState(10);

  const [maxAttempts, setMaxAttempts] =
    useState(1);

  const [shuffleQuestions, setShuffleQuestions] =
    useState(true);

  const [shuffleOptions, setShuffleOptions] =
    useState(true);

  /*
    Default sections.
  */

  const [sections, setSections] =
    useState([
      "Reasoning",
      "Verbal",
      "Quants",
    ]);

  const [questions, setQuestions] =
    useState([
      blankQuestion("Reasoning"),
    ]);

  /*
    UPDATE QUESTION
  */

  const updateQuestion = (
    index,
    value
  ) => {
    setQuestions((items) =>
      items.map((q, i) =>
        i === index
          ? {
              ...q,
              question: value,
            }
          : q
      )
    );
  };

  /*
    UPDATE OPTION
  */

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuestions((items) =>
      items.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map(
                (option, j) =>
                  j === optionIndex
                    ? value
                    : option
              ),
            }
          : q
      )
    );
  };

  /*
    UPDATE CORRECT ANSWER
  */

  const updateCorrectAnswer = (
    questionIndex,
    answer
  ) => {
    setQuestions((items) =>
      items.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              correctAnswer: answer,
            }
          : q
      )
    );
  };

  /*
    UPDATE SECTION
  */

  const updateSection = (
    questionIndex,
    section
  ) => {
    setQuestions((items) =>
      items.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              section,
            }
          : q
      )
    );
  };

  /*
    ADD QUESTION
  */

  const addQuestion = () => {
    setQuestions((items) => [
      ...items,
      blankQuestion(
        sections[0] || "General"
      ),
    ]);
  };

  /*
    REMOVE QUESTION
  */

  const removeQuestion = (
    index
  ) => {
    setQuestions((items) =>
      items.length === 1
        ? items
        : items.filter(
            (_, i) => i !== index
          )
    );
  };

  /*
    ADD SECTION
  */

  const addSection = () => {
    const name = window.prompt(
      "Section name (for example: General Knowledge)"
    );

    if (
      name?.trim() &&
      !sections.includes(
        name.trim()
      )
    ) {
      setSections((items) => [
        ...items,
        name.trim(),
      ]);
    }
  };

  /*
    REMOVE SECTION
  */

  const removeSection = (
    section
  ) => {
    if (sections.length === 1) {
      return;
    }

    const fallback =
      sections.find(
        (item) =>
          item !== section
      ) || "General";

    setSections((items) =>
      items.filter(
        (item) =>
          item !== section
      )
    );

    setQuestions((items) =>
      items.map((question) =>
        question.section === section
          ? {
              ...question,
              section: fallback,
            }
          : question
      )
    );
  };

  /*
    SECTION COUNTS
  */

  const counts = useMemo(
    () =>
      sections.map(
        (section) => ({
          section,
          count:
            questions.filter(
              (question) =>
                question.section ===
                section
            ).length,
        })
      ),
    [sections, questions]
  );

  /*
    SAVE AND PUBLISH QUIZ

    This keeps:
    - Timer
    - Maximum attempts
    - Randomize questions
    - Randomize options
    - Sections
    - Questions
    - Correct answers

    The important fix is that the quiz
    is now sent through onSave OR
    onCreateQuiz.
  */

  const saveQuiz = () => {
    /*
      TITLE VALIDATION
    */

    if (!title.trim()) {
      alert(
        "Please enter a quiz title."
      );
      return;
    }

    /*
      TIMER VALIDATION
    */

    if (
      !durationMinutes ||
      Number(durationMinutes) < 1
    ) {
      alert(
        "Timer must be at least 1 minute."
      );
      return;
    }

    /*
      ATTEMPTS VALIDATION
    */

    if (
      !maxAttempts ||
      Number(maxAttempts) < 1
    ) {
      alert(
        "Maximum attempts must be at least 1."
      );
      return;
    }

    /*
      QUESTION VALIDATION
    */

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const currentQuestion =
        questions[i];

      /*
        QUESTION TEXT
      */

      if (
        !currentQuestion.question.trim()
      ) {
        alert(
          `Please enter Question ${
            i + 1
          }.`
        );
        return;
      }

      /*
        FOUR OPTIONS
      */

      if (
        currentQuestion.options.some(
          (option) =>
            !option.trim()
        )
      ) {
        alert(
          `Please fill all four options for Question ${
            i + 1
          }.`
        );
        return;
      }

      /*
        CORRECT ANSWER
      */

      if (
        !currentQuestion.correctAnswer
      ) {
        alert(
          `Please select the correct answer for Question ${
            i + 1
          }.`
        );
        return;
      }
    }

    /*
      CREATE QUIZ OBJECT
    */

    const quizData = {
      id:
        `quiz_${Date.now()}`,

      title:
        title.trim(),

      durationMinutes:
        Number(durationMinutes),

      maxAttempts:
        Number(maxAttempts),

      shuffleQuestions:
        shuffleQuestions,

      shuffleOptions:
        shuffleOptions,

      sections:
        counts.map(
          (item) =>
            item.section
        ),

      questions:
        questions.map(
          (question) => ({
            question:
              question.question.trim(),

            options:
              question.options.map(
                (option) =>
                  option.trim()
              ),

            correctAnswer:
              question.correctAnswer,

            section:
              question.section,
          })
        ),

      createdAt:
        new Date().toISOString(),

      status:
        "published",
    };

    /*
      IMPORTANT FIX

      Your old CreateQuiz expected
      onSave.

      If your App currently uses
      onCreateQuiz, this also supports
      that name.

      So either one will work.
    */

    const saveHandler =
      typeof onSave === "function"
        ? onSave
        : typeof onCreateQuiz ===
          "function"
        ? onCreateQuiz
        : null;

    /*
      CHECK PARENT FUNCTION
    */

    if (!saveHandler) {
      console.error(
        "CreateQuiz: No onSave or onCreateQuiz function was provided."
      );

      alert(
        "Unable to publish the quiz. Please check the CreateQuiz connection in App.jsx."
      );

      return;
    }

    /*
      SEND QUIZ TO APP.JSX
    */

    saveHandler(quizData);
  };

  return (
    <div className="create-page">

      <div className="create-container">

        {/* TOP BAR */}

        <div className="create-topbar">

          <button
            type="button"
            className="back-button"
            onClick={onCancel}
          >
            ← Back
          </button>

          <div className="create-status">

            <span className="status-dot"></span>

            Teacher · Draft Quiz

          </div>

        </div>

        {/* HEADING */}

        <div className="create-heading">

          <div>

            <div className="eyebrow">
              QUIZ BUILDER
            </div>

            <h1>
              Create Your Quiz
            </h1>

            <p>
              Configure the rules once,
              organize questions into parts,
              and publish a shareable
              quiz link.
            </p>

          </div>

          <div className="question-counter">

            <strong>
              {questions.length}
            </strong>

            <span>
              Questions
            </span>

          </div>

        </div>

        {/* QUIZ RULES */}

        <div className="builder-card">

          <div className="card-heading">

            <div className="card-icon purple">
              Q
            </div>

            <div>

              <h2>
                Quiz Details & Rules
              </h2>

              <p>
                These settings apply to
                every student attempt.
              </p>

            </div>

          </div>

          <div className="settings-grid">

            {/* TITLE */}

            <div className="input-group wide">

              <label>
                Quiz Title
              </label>

              <input
                placeholder="Example: Aptitude Assessment"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>

            {/* TIMER */}

            <div className="input-group">

              <label>
                Timer (minutes)
              </label>

              <input
                type="number"
                min="1"
                max="180"
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(
                    e.target.value
                  )
                }
              />

            </div>

            {/* ATTEMPTS */}

            <div className="input-group">

              <label>
                Maximum Attempts
              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={maxAttempts}
                onChange={(e) =>
                  setMaxAttempts(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* SHUFFLE SETTINGS */}

          <div className="toggle-grid">

            <label className="toggle-row">

              <input
                type="checkbox"
                checked={
                  shuffleQuestions
                }
                onChange={(e) =>
                  setShuffleQuestions(
                    e.target.checked
                  )
                }
              />

              <span>
                Randomize questions
              </span>

              <small>
                Each attempt gets a
                different question order.
              </small>

            </label>

            <label className="toggle-row">

              <input
                type="checkbox"
                checked={
                  shuffleOptions
                }
                onChange={(e) =>
                  setShuffleOptions(
                    e.target.checked
                  )
                }
              />

              <span>
                Randomize options
              </span>

              <small>
                Answer choices are shuffled
                while preserving the correct
                answer.
              </small>

            </label>

          </div>

        </div>

        {/* SECTIONS */}

        <div className="builder-card">

          <div className="card-heading">

            <div className="card-icon purple">
              §
            </div>

            <div>

              <h2>
                Quiz Parts / Sections
              </h2>

              <p>
                Example: Reasoning,
                Verbal and Quants.
              </p>

            </div>

            <button
              type="button"
              className="secondary-mini section-add"
              onClick={addSection}
            >
              + Add Part
            </button>

          </div>

          <div className="section-editor">

            {counts.map(
              ({
                section,
                count,
              }) => (

                <div
                  className="section-chip"
                  key={section}
                >

                  <span>
                    {section}
                  </span>

                  <small>
                    {count} question
                    {count !== 1
                      ? "s"
                      : ""}
                  </small>

                  {sections.length >
                    1 && (

                    <button
                      type="button"
                      onClick={() =>
                        removeSection(
                          section
                        )
                      }
                    >
                      ×
                    </button>

                  )}

                </div>

              )
            )}

          </div>

        </div>

        {/* QUESTIONS TITLE */}

        <div className="questions-title">

          <div>

            <h2>
              Questions
            </h2>

            <p>
              Assign each question to a
              quiz part.
            </p>

          </div>

          <span className="question-badge">

            {questions.length} Added

          </span>

        </div>

        {/* QUESTIONS */}

        {questions.map(
          (
            question,
            questionIndex
          ) => (

            <div
              className="builder-card question-builder"
              key={questionIndex}
            >

              {/* QUESTION HEADER */}

              <div className="question-top">

                <div className="question-heading">

                  <div className="question-number">
                    {questionIndex + 1}
                  </div>

                  <div>

                    <h3>
                      Question{" "}
                      {questionIndex + 1}
                    </h3>

                    <p>
                      Choose the correct
                      answer and section.
                    </p>

                  </div>

                </div>

                {questions.length >
                  1 && (

                  <button
                    type="button"
                    className="remove-question"
                    onClick={() =>
                      removeQuestion(
                        questionIndex
                      )
                    }
                  >
                    Remove
                  </button>

                )}

              </div>

              {/* QUESTION CONFIGURATION */}

              <div className="question-config">

                {/* SECTION */}

                <div className="input-group">

                  <label>
                    Part / Section
                  </label>

                  <select
                    value={
                      question.section
                    }
                    onChange={(e) =>
                      updateSection(
                        questionIndex,
                        e.target.value
                      )
                    }
                  >

                    {sections.map(
                      (section) => (

                        <option
                          key={section}
                          value={section}
                        >
                          {section}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* QUESTION */}

                <div className="input-group">

                  <label>
                    Question
                  </label>

                  <textarea
                    placeholder="Type your question here..."
                    value={
                      question.question
                    }
                    onChange={(e) =>
                      updateQuestion(
                        questionIndex,
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* ANSWER HEADING */}

              <div className="answers-heading">

                <div>

                  <h4>
                    Answer Options
                  </h4>

                  <p>
                    Select the correct answer.
                  </p>

                </div>

              </div>

              {/* OPTIONS */}

              <div className="options-grid">

                {question.options.map(
                  (
                    option,
                    optionIndex
                  ) => {

                    const letter =
                      String.fromCharCode(
                        65 +
                          optionIndex
                      );

                    const isCorrect =
                      question.correctAnswer ===
                      letter;

                    return (

                      <div
                        className={`option-card ${
                          isCorrect
                            ? "correct"
                            : ""
                        }`}
                        key={letter}
                      >

                        <span className="option-letter">
                          {letter}
                        </span>

                        <input
                          placeholder={`Option ${letter}`}
                          value={option}
                          onChange={(e) =>
                            updateOption(
                              questionIndex,
                              optionIndex,
                              e.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          className={`answer-selector ${
                            isCorrect
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            updateCorrectAnswer(
                              questionIndex,
                              letter
                            )
                          }
                        >
                          {isCorrect
                            ? "✓"
                            : ""}
                        </button>

                        {isCorrect && (

                          <span className="correct-label">
                            Correct
                          </span>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          )
        )}

        {/* ADD QUESTION */}

        <button
          type="button"
          className="add-question"
          onClick={addQuestion}
        >

          <span className="add-icon">
            ＋
          </span>

          <span>

            <strong>
              Add Another Question
            </strong>

            <small>
              Keep building your quiz.
            </small>

          </span>

        </button>

        {/* FOOTER */}

        <div className="builder-footer">

          <button
            type="button"
            className="footer-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="footer-save"
            onClick={saveQuiz}
          >
            Save & Publish Quiz ✓
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateQuiz;