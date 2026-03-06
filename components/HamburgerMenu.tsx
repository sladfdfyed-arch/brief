"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./HamburgerMenu.module.css";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className={styles.menu} aria-label="Admin">
            <Link
              href="/admin"
              className={styles.link}
              onClick={() => setOpen(false)}
            >
              Add / edit products
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
