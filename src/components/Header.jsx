import React from "react";

function Header({
  role,
  user,
  onHome,
  onCreate,
  onLogout,
}) {
  return (
    <header className="app-header">

      <div
        className="brand"
        onClick={onHome}
      >
        <div className="brand-icon">
          Q
        </div>

        <div>
          <strong>
            Quiz Studio
          </strong>

          <span>
            Interactive Learning
          </span>
        </div>
      </div>

      <nav className="header-nav">

        <button
          className="nav-button"
          onClick={onHome}
        >
          Dashboard
        </button>

        {role === "teacher" && (
          <button
            className="nav-create"
            onClick={onCreate}
          >
            + Create Quiz
          </button>
        )}

        <span className="user-pill">
          {user?.name || role}
        </span>

        <button
          className="nav-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </nav>

    </header>
  );
}

export default Header;