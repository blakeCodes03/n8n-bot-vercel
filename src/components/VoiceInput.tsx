import React from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Mic, Square, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useStore from "@/useStore";

interface VoiceInputProps {
  onVoiceMessage: (audioBlob: Blob) => void;
}


const VoiceInput = ({ onVoiceMessage }: VoiceInputProps) => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      onStop: async (blobUrl) => {
        try {
          const response = await fetch(blobUrl);
          const blob = await response.blob();
          const formData = new FormData();
          useStore.getState().setIsLoadingVoiceText(true)
          formData.append("file", blob, "audio.wav");

          const serverResponse = await fetch(
            // "http://localhost:5000/transcribe",
            "/api/transcribe",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!serverResponse.ok) {
            throw new Error("Failed to transcribe audio");
          }

          const { text } = await serverResponse.json();
          console.log(text);
          onVoiceMessage(text);

          // Update the global state with the transcribed text
        useStore.getState().setText(text);

        useStore.getState().setIsLoadingVoiceText(false);

        } catch (error) {
          toast.error("Failed to process voice message");
        }
      },
    });

  const isRecording = status === "recording";
  isRecording ? useStore.getState().setIsRecording(true) : useStore.getState().setIsRecording(false);

  const isLoading = useStore((state) => state.isLoadingVoiceText);

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={isRecording ? "text-red-500 animate-pulse" : ""}
      title={isRecording ? "Stop recording" : "Start recording"}
    >
      {!isLoading && (isRecording ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      ))}
      {isLoading && <Loader className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceInput;
