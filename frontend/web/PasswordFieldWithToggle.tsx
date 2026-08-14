"use client";

import { useState, type CSSProperties, type InputHTMLAttributes } from "react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  inputStyle?: CSSProperties;
}

export function PasswordFieldWithToggle({
  name = "password",
  placeholder = "Enter password",
  required = true,
  autoComplete = "current-password",
  readOnly: readOnlyProp,
  style,
  inputStyle,
  className,
  onFocus,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(Boolean(readOnlyProp));

  return (
    <div
      className="password-toggle-wrapper"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        ...style,
      }}
    >
      <input
        {...props}
        autoComplete={autoComplete}
        className={className}
        name={name}
        placeholder={placeholder}
        required={required}
        readOnly={isReadOnly}
        type={showPassword ? "text" : "password"}
        onFocus={(event) => {
          if (isReadOnly) setIsReadOnly(false);
          onFocus?.(event);
        }}
        style={{
          width: "100%",
          paddingRight: "2.75rem",
          boxSizing: "border-box",
          ...inputStyle,
        }}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        style={{
          position: "absolute",
          right: "0.6rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#64748b",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          borderRadius: "4px",
          transition: "color 150ms ease",
        }}
        title={showPassword ? "Hide password" : "Show password"}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
