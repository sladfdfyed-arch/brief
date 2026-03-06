"use client";

import { useRef, useState } from "react";
import styles from "./AudioRecorder.module.css";

interface AudioRecorderProps {
  onRecorded: (blob: Blob) => Promise<void>;
  disabled?: boolean;
}

export default function AudioRecorder({
  onRecorded,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || disabled) {
      return;
    }
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    const chunks: BlobPart[] = [];

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", async () => {
      setIsRecording(false);
      stream.getTracks().forEach((track) => track.stop());
      setIsSaving(true);
      try {
        const blob = new Blob(chunks, { type: "audio/webm" });
        await onRecorded(blob);
      } catch {
        setError("Could not upload recording.");
      } finally {
        setIsSaving(false);
      }
    });

    recorder.start();
    setIsRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
  };

  return (
    <div className={styles.wrapper}>
      {!isRecording ? (
        <button
          className={styles.button}
          onClick={start}
          disabled={disabled || isSaving}
          type="button"
        >
          {isSaving ? "Saving..." : "Record Voiceover"}
        </button>
      ) : (
        <button className={styles.stopButton} onClick={stop} type="button">
          Stop Recording
        </button>
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
