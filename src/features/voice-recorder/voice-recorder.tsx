"use client";

import { Button } from "@/components/ui/button";
import { MatchEventType } from "@/lib/utils";
import { Mic } from "lucide-react";
import { useRef, useState } from "react";

interface VoiceRecorderProps {
  homeTeam: string;
  awayTeam: string;
}

export default function VoiceRecorder({
  homeTeam,
  awayTeam,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [lastEvent, setLastEvent] = useState<MatchEventType | null>(null);
  const [isLoading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setLoading(true);
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/mpeg",
      });
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.mp3");
      formData.append("homeTeam", homeTeam);
      formData.append("awayTeam", awayTeam);

      const res = await fetch("/api/voice", { method: "POST", body: formData });
      const data = await res.json();

      const event: MatchEventType = {
        ...data.structured,
      };

      setLastEvent(event);
      setLoading(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <>
      <Button
        onClick={recording ? stopRecording : startRecording}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        <Mic />
        {recording ? "Fin évènement" : "Début évènement"}
      </Button>
      {isLoading && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h1 className="font-bold">En cours de traitement...</h1>
          <div className="border-primary flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-t-transparent"></div>
        </div>
      )}
      {lastEvent && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-bold">Dernier évènement :</h3>
          <pre>{JSON.stringify(lastEvent, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
