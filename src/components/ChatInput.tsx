'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ButtonIcon } from './ButtonIcon';
import { IconSlot } from './IconSlot';
import styles from './ChatInput.module.css';

/**
 * Figma axis `Status`, minus Recording: recording is not shown inside the chat
 * input in this prototype.
 */
export type ChatInputStatus = 'Inactive' | 'Typing' | 'Loading' | 'Ready to send' | 'Long input';

export type ChatInputProps = {
  /**
   * Forces a state, for a story or a doc. Left unset, the field derives it:
   * Inactive when empty, Typing when empty and focused, Ready to send with one
   * line of text, Long input once the text wraps. Loading is never derived:
   * pass it while the answer is being judged.
   */
  Status?: ChatInputStatus;
  /** Code-only. The text in the field. Omit to let the field hold its own. */
  value?: string;
  /** Code-only. Initial text when `value` is not passed. */
  defaultValue?: string;
  /** Code-only. Called on every edit with the new text. */
  onValueChange?: (value: string) => void;
  /** Code-only. Sentence case. */
  placeholder?: string;
  /** Code-only. The field's accessible name. Sentence case. */
  label?: string;
  /** Code-only. The send control, shown once there is text. */
  onSend?: (value: string) => void;
  /** Code-only. The microphone, shown while the field is empty. */
  onMicPress?: () => void;
  className?: string;
};

export function ChatInput({
  Status,
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Type your answer',
  label = 'Your answer',
  onSend,
  onMicPress,
  className,
}: ChatInputProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [wraps, setWraps] = useState(false);

  const text = value ?? ownValue;

  // The field grows with its text, and a second line is what makes it Long
  // input. Measured after layout so the height is the rendered one, and again
  // when the width changes or Inter finishes loading, since both rewrap it.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      field.style.height = 'auto';
      field.style.height = `${field.scrollHeight}px`;
      const lineHeight = parseFloat(getComputedStyle(field).lineHeight);
      setWraps(field.scrollHeight > lineHeight * 1.5);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (field.parentElement) observer.observe(field.parentElement);
    document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text, Status]);

  const derived: ChatInputStatus =
    text.length === 0 ? (focused ? 'Typing' : 'Inactive') : wraps ? 'Long input' : 'Ready to send';
  const status = Status ?? derived;
  const loading = status === 'Loading';
  const hasSend = status === 'Ready to send' || status === 'Long input';

  const change = (next: string) => {
    if (value === undefined) setOwnValue(next);
    onValueChange?.(next);
  };

  const send = () => {
    onSend?.(text);
    if (value === undefined) setOwnValue('');
  };

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-status={status}
      aria-busy={loading || undefined}
    >
      <div className={styles.container}>
        <div className={styles.fieldWrap}>
          <textarea
            ref={fieldRef}
            className={styles.field}
            rows={1}
            value={text}
            placeholder={placeholder}
            aria-label={label}
            readOnly={loading}
            data-forced-caret={Status === 'Typing' || undefined}
            onChange={(event) => change(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {/* The caret the Typing master draws, for when Typing is forced and
              the field is not really focused. A focused field shows its own. */}
          {Status === 'Typing' && <span className={styles.caret} aria-hidden />}
        </div>
        {loading ? (
          <IconSlot size="300" name="loading-01" label="Sending" />
        ) : hasSend ? (
          <ButtonIcon
            className={styles.send}
            variant="Primary"
            size="M"
            name="send-03"
            label="Send"
            onClick={send}
          />
        ) : (
          <ButtonIcon
            className={styles.mic}
            variant="Text"
            size="L"
            name="microphone-01"
            label="Answer by voice"
            onClick={onMicPress}
          />
        )}
      </div>
    </div>
  );
}
