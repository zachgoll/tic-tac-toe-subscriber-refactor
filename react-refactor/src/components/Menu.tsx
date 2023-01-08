import classNames from "classnames";
import { useState } from "react";

import "./Menu.css";

type Props = {
  onAction(action: "reset" | "new-round"): void;
};

export default function Menu({ onAction }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="menu">
      <button className="menu-btn" onClick={() => setMenuOpen((prev) => !prev)}>
        Actions
        <i
          className={classNames(
            "fa-solid",
            menuOpen ? "fa-chevron-up" : "fa-chevron-down"
          )}
        ></i>
      </button>

      {menuOpen && (
        <div className="items border">
          <button
            onClick={() => {
              onAction("reset");
              setMenuOpen(false);
            }}
          >
            Reset
          </button>
          <button
            onClick={() => {
              onAction("new-round");
              setMenuOpen(false);
            }}
          >
            New Round
          </button>
        </div>
      )}
    </div>
  );
}
