import React, { useState } from "react";

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] =
    useState("student");

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =========================================================
  PASSWORD VALIDATION
  =========================================================
  */

  const validatePassword = (value) => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value)
    );
  };

  /*
  =========================================================
  ROLE CHANGE
  =========================================================
  */

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setIdentifier("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  /*
  =========================================================
  GET SAVED ACCOUNTS
  =========================================================
  */

  const getAccounts = () => {
    const savedAccounts =
      localStorage.getItem(
        "quizStudio_accounts"
      );

    if (!savedAccounts) {
      return [];
    }

    try {
      return JSON.parse(savedAccounts);
    } catch {
      return [];
    }
  };

  /*
  =========================================================
  SAVE ACCOUNTS
  =========================================================
  */

  const saveAccounts = (accounts) => {
    localStorage.setItem(
      "quizStudio_accounts",
      JSON.stringify(accounts)
    );
  };

  /*
  =========================================================
  LOGIN
  =========================================================
  */

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const enteredIdentifier =
      identifier.trim();

    /*
    ---------------------------------------------------------
    CHECK USERNAME / EMAIL
    ---------------------------------------------------------
    */

    if (!enteredIdentifier) {
      setError(
        selectedRole === "teacher"
          ? "Please enter your teacher email."
          : "Please enter your student ID."
      );

      return;
    }

    /*
    ---------------------------------------------------------
    CHECK PASSWORD
    ---------------------------------------------------------
    */

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    /*
    ---------------------------------------------------------
    CHECK PASSWORD FORMAT
    ---------------------------------------------------------
    */

    if (!validatePassword(password)) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
      );

      return;
    }

    /*
    =========================================================
    LOAD EXISTING ACCOUNTS
    =========================================================
    */

    const accounts = getAccounts();

    /*
    =========================================================
    CREATE A UNIQUE ACCOUNT KEY
    =========================================================

    Student and Teacher accounts are kept separate.

    Example:

    student:44110588

    teacher:teacher@gmail.com
    =========================================================
    */

    const accountKey =
      `${selectedRole}:${enteredIdentifier.toLowerCase()}`;

    /*
    =========================================================
    CHECK WHETHER ACCOUNT ALREADY EXISTS
    =========================================================
    */

    const existingAccount =
      accounts.find(
        (account) =>
          account.key === accountKey
      );

    /*
    =========================================================
    EXISTING ACCOUNT
    =========================================================
    */

    if (existingAccount) {
      /*
      -------------------------------------------------------
      CHECK PASSWORD
      -------------------------------------------------------
      */

      if (
        existingAccount.password !==
        password
      ) {
        setError(
          "Incorrect password. Please try again."
        );

        return;
      }

      /*
      -------------------------------------------------------
      CORRECT PASSWORD
      -------------------------------------------------------
      */

      onLogin({
        role: selectedRole,

        user: {
          id:
            selectedRole === "student"
              ? existingAccount.identifier
              : undefined,

          email:
            selectedRole === "teacher"
              ? existingAccount.identifier
              : undefined,

          name:
            existingAccount.name ||
            (
              selectedRole === "student"
                ? "Student"
                : "Teacher"
            ),
        },
      });

      return;
    }

    /*
    =========================================================
    NEW ACCOUNT
    =========================================================

    If this username/email has never been used before,
    create the account using the entered password.
    =========================================================
    */

    const newAccount = {
      key: accountKey,

      role: selectedRole,

      identifier:
        enteredIdentifier,

      password:
        password,

      name:
        selectedRole === "student"
          ? "Student"
          : "Teacher",

      createdAt:
        new Date().toISOString(),
    };

    const updatedAccounts = [
      ...accounts,
      newAccount,
    ];

    saveAccounts(updatedAccounts);

    /*
    =========================================================
    LOGIN NEW USER
    =========================================================
    */

    onLogin({
      role: selectedRole,

      user: {
        id:
          selectedRole === "student"
            ? enteredIdentifier
            : undefined,

        email:
          selectedRole === "teacher"
            ? enteredIdentifier
            : undefined,

        name:
          selectedRole === "student"
            ? "Student"
            : "Teacher",
      },
    });
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-content">

          {/* HEADER */}

          <div className="login-header">

            <div className="login-logo">
              Q
            </div>

            <div>
              <h2>
                Quiz Studio
              </h2>

              <p>
                Interactive Learning
              </p>
            </div>

          </div>

          {/* TITLE */}

          <div className="login-form-header">

            <span className="login-label">
              SECURE LOGIN
            </span>

            <h1>
              Welcome back
            </h1>

            <p>
              Select your account type and enter
              your login details to continue.
            </p>

          </div>

          {/* ROLE SELECTION */}

          <div className="role-tabs">

            <button
              type="button"
              className={
                selectedRole === "student"
                  ? "role-tab active"
                  : "role-tab"
              }
              onClick={() =>
                handleRoleChange("student")
              }
            >
              <span className="role-icon">
                S
              </span>

              <span className="role-text">

                <strong>
                  Student
                </strong>

                <small>
                  Attend quizzes and view results
                </small>

              </span>

            </button>

            <button
              type="button"
              className={
                selectedRole === "teacher"
                  ? "role-tab active"
                  : "role-tab"
              }
              onClick={() =>
                handleRoleChange("teacher")
              }
            >
              <span className="role-icon">
                T
              </span>

              <span className="role-text">

                <strong>
                  Teacher
                </strong>

                <small>
                  Create quizzes and manage results
                </small>

              </span>

            </button>

          </div>

          {/* LOGIN FORM */}

          <form
            className="professional-login-form"
            onSubmit={handleLogin}
          >

            {/* USERNAME / EMAIL */}

            <div className="login-input-group">

              <label>
                {selectedRole === "teacher"
                  ? "Teacher Email"
                  : "Student ID"}
              </label>

              <div className="input-container">

                <span className="input-icon">
                  {selectedRole === "teacher"
                    ? "@"
                    : "#"}
                </span>

                <input
                  type={
                    selectedRole === "teacher"
                      ? "email"
                      : "text"
                  }
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder={
                    selectedRole === "teacher"
                      ? "Enter your email address"
                      : "Enter your student ID"
                  }
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="login-input-group">

              <label>
                Password
              </label>

              <div className="input-container">

                <span className="input-icon">
                  *
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* PASSWORD REQUIREMENTS */}

            <div className="password-box">

              <div className="password-box-title">
                Password requirements
              </div>

              <div className="password-rules">

                <span>
                  <i></i>
                  Minimum 8 characters
                </span>

                <span>
                  <i></i>
                  At least one uppercase letter
                </span>

                <span>
                  <i></i>
                  At least one lowercase letter
                </span>

                <span>
                  <i></i>
                  At least one number
                </span>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="professional-login-error">
                {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="professional-login-button"
            >
              Sign in

              <span>
                →
              </span>

            </button>

          </form>

          {/* SECURITY INFORMATION */}

          <div className="login-information">

            <div className="information-icon">
              i
            </div>

            <div>

              <strong>
                Secure account access
              </strong>

              <p>
                {selectedRole === "teacher"
                  ? "Teachers can create quizzes, manage questions and view quiz-specific leaderboards."
                  : "Students can attend available quizzes and view their quiz results."}
              </p>

            </div>

          </div>

          <div className="login-footer">
            Quiz Studio · Interactive Learning
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;