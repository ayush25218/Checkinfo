"use client";

import { useState, type InputHTMLAttributes } from "react";

type AutofillSafeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  initiallyReadOnly?: boolean;
};

export function AutofillSafeInput({
  autoComplete = "off",
  initiallyReadOnly = true,
  onFocus,
  readOnly: readOnlyProp,
  ...props
}: AutofillSafeInputProps) {
  const [isReadOnly, setIsReadOnly] = useState(Boolean(initiallyReadOnly || readOnlyProp));

  return (
    <input
      {...props}
      autoComplete={autoComplete}
      readOnly={isReadOnly}
      onFocus={(event) => {
        if (isReadOnly) setIsReadOnly(false);
        onFocus?.(event);
      }}
    />
  );
}
