"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, BotMessageSquare } from "lucide-react"
import ItineraryDisplay from "@/components/ItineraryDisplay"

interface AudioMessage {
  id: string
  role: "user" | "assistant"
  content: string
  audioUrl?: string
  timestamp: Date
  isPlaying?: boolean
}

interface AudioChatInterfaceProps {
  onTriggerApiModal: () => void
}

export default function VoiceInterface({ onTriggerApiModal }: AudioChatInterfaceProps) {
  const [messages, setMessages] = useState<AudioMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Itinera AI, your personal travel planner. I can help you create amazing itineraries, find accommodations, suggest restaurants, and plan your perfect trip. Where would you like to go?",
      timestamp: new Date(),
    },
  ])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Remove audio context initialization - only recording animation now

  const startRecording = async () => {
    // Comment out the actual recording functionality since we want to trigger the modal
    /*
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudioMessage(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Unable to access microphone. Please check your permissions.")
    }
    */
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAudioMessage = async (audioBlob: Blob) => {
    // Simulate transcription (no audio response)
    const transcribedText = "I'd like to plan a 3-day trip to Tokyo with a medium budget."

    const userMessage: AudioMessage = {
      id: Date.now().toString(),
      role: "user",
      content: transcribedText,
      audioUrl: URL.createObjectURL(audioBlob),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: AudioMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Great choice! Tokyo is an amazing destination. I'll help you create a perfect 3-day itinerary with a medium budget. Let me suggest some must-visit places, accommodations, and local dining experiences that will make your trip unforgettable.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsProcessing(false)

      // No audio response - just display the text
    }, 2000)
  }

  // Removed audio playback functions - only recording animation now

  const togglePlayback = (messageId: string, audioUrl?: string, text?: string) => {
    // Disabled audio playback - only show recording animation
    return
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Audio Chat Panel */}
      <Card className="flex flex-col gradient-card border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BotMessageSquare className="w-5 h-5 text-primary" />
              Chat with Itinera AI
            </h2>
            {/* <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)} className="gap-2">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button> */}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  {/* Audio playback controls removed - only recording animation */}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary audio-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">Processing your request...</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-16 h-16 rounded-full ${isRecording
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {isRecording ? "Recording... Tap to stop" : isProcessing ? "Processing..." : "Tap to speak"}
              </p>
            </div>
          </div>

          {/* Audio Visualization - Recording Animation Only */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Travel Output Panel */}
      <ItineraryDisplay isThinkingComplete={false} />
    </div>
  )
}
