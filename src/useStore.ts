import { create } from "zustand";

interface StoreState {
  text: string;
  setText: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isLoadingVoiceText: boolean;
  setIsLoadingVoiceText: (isRecording: boolean) => void;
  botMessage: string;
  setBotMessage: (botMessage: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

}

const useStore = create<StoreState>((set) => ({
  text: "",
  setText: (text) => set({ text }),
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),
  isLoadingVoiceText: false,
  setIsLoadingVoiceText: (isLoadingVoiceText) => set({ isLoadingVoiceText }),
  botMessage: "",
  setBotMessage: (botMessage) => set({ botMessage }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useStore;
