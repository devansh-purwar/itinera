"use client"

import { useChat } from "@ai-sdk/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, MapPin, Calendar, Star, Clock, Phone, Info, Navigation, Utensils, Brain, Lightbulb, ChevronDown, ChevronUp, BotMessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ItineraryDisplay from "./ItineraryDisplay"
import { useState, useEffect, useRef } from "react"
import thinkingData from "@/app/data/thinking.json"

interface TextChatInterfaceProps {
  onTriggerApiModal: () => void
}

// Configuration for thinking animation timing
const THINKING_CONFIG = {
  initialDelay: 800, // Initial delay before thinking starts
  stepBaseDelay: 400, // Base delay between steps
  stepRandomDelay: 200, // Random additional delay (0 to this value)
  typingSpeed: 25, // Characters per second for typing effect
  pauseBetweenSentences: 100, // Pause between sentences in typing
  dotAnimationSpeed: 300, // Speed of thinking dots animation
  completionDelay: 2000, // Delay after thinking before showing output panel
}

export default function ChatInterface({ onTriggerApiModal }: TextChatInterfaceProps) {
  // Simple chat state management
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Thinking process state
  const [isThinking, setIsThinking] = useState(false)
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0)
  const [thinkingSteps, setThinkingSteps] = useState<Array<{ title: string; description: string; displayedText: string; isComplete: boolean }>>([])
  const [showOutputPanel, setShowOutputPanel] = useState(false)
  const [isThinkingComplete, setIsThinkingComplete] = useState(false)
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true)
  const thinkingTimeouts = useRef<NodeJS.Timeout[]>([])
  const typingIntervals = useRef<NodeJS.Timeout[]>([])

  // Auto-collapse thinking after a few steps to save space
  useEffect(() => {
    if (currentThinkingStep >= 2 && isThinkingExpanded) {
      const timeout = setTimeout(() => {
        setIsThinkingExpanded(false)
      }, 3000) // Auto-collapse after 3 seconds when on step 3+

      return () => clearTimeout(timeout)
    }
  }, [currentThinkingStep, isThinkingExpanded])

  // Clear all timeouts and intervals
  const clearAllTimers = () => {
    thinkingTimeouts.current.forEach(clearTimeout)
    typingIntervals.current.forEach(clearTimeout)
    thinkingTimeouts.current = []
    typingIntervals.current = []
  }

  // Typing effect for thinking steps
  const typeText = (text: string, stepIndex: number, onComplete: () => void) => {
    let currentText = ""
    let charIndex = 0

    const typeChar = () => {
      if (charIndex < text.length) {
        currentText += text[charIndex]
        setThinkingSteps(prev =>
          prev.map((step, idx) =>
            idx === stepIndex ? { ...step, displayedText: currentText } : step
          )
        )
        charIndex++

        // Add pauses at sentence endings
        const isPunctuation = /[.!?]/.test(text[charIndex - 1])
        const delay = isPunctuation ? THINKING_CONFIG.pauseBetweenSentences : (1000 / THINKING_CONFIG.typingSpeed)

        const timeout = setTimeout(typeChar, delay)
        typingIntervals.current.push(timeout)
      } else {
        onComplete()
      }
    }

    typeChar()
  }

  // Start thinking process
  const startThinkingProcess = () => {
    setIsThinking(true)
    setCurrentThinkingStep(0)
    setShowOutputPanel(false)
    clearAllTimers()

    // Initialize thinking steps
    const steps = thinkingData.map(step => ({
      ...step,
      displayedText: "",
      isComplete: false
    }))
    setThinkingSteps(steps)

    // Start the thinking sequence
    const processStep = (stepIndex: number) => {
      if (stepIndex >= thinkingData.length) {
        // Thinking complete - show completion animation
        setThinkingSteps(prev =>
          prev.map(step => ({ ...step, isComplete: true }))
        )

        const timeout = setTimeout(() => {
          setIsThinking(false)
          setIsThinkingComplete(true)
          // Add completion message
          const completionMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: "✅ Analysis complete! I've thoroughly planned your trip. Check the detailed insights panel on the right."
          }
          setMessages(prev => [...prev, completionMessage])
          setShowOutputPanel(true)
        }, THINKING_CONFIG.completionDelay)
        thinkingTimeouts.current.push(timeout)
        return
      }

      setCurrentThinkingStep(stepIndex)

      // Random delay before starting this step
      const delay = THINKING_CONFIG.stepBaseDelay + Math.random() * THINKING_CONFIG.stepRandomDelay

      const timeout = setTimeout(() => {
        typeText(steps[stepIndex].description, stepIndex, () => {
          // Mark step as complete
          setThinkingSteps(prev =>
            prev.map((step, idx) =>
              idx === stepIndex ? { ...step, isComplete: true } : step
            )
          )

          // Process next step
          const nextTimeout = setTimeout(() => processStep(stepIndex + 1), 400)
          thinkingTimeouts.current.push(nextTimeout)
        })
      }, stepIndex === 0 ? THINKING_CONFIG.initialDelay : delay)

      thinkingTimeouts.current.push(timeout)
    }

    processStep(0)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking || isLoading) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Start thinking process
    setIsLoading(true)
    const timeout = setTimeout(() => {
      setIsLoading(false)
      startThinkingProcess()
    }, 500)
    thinkingTimeouts.current.push(timeout)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers()
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Chat Panel */}
      <Card className="flex flex-col gradient-card border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BotMessageSquare className="w-5 h-5 text-primary" />
            Chat with Itinera AI
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isThinking && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                <p className="text-sm">
                  Hello! I'm Itinera AI, your personal travel planner. I can help you create amazing itineraries, find accommodations,
                  suggest restaurants, and provide local insights. Where would you like to go?
                </p>
                <div className="mt-2 text-xs opacity-75">
                  Try: "Plan a 5-day cultural trip to Tokyo with a medium budget"
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Thinking Process Display */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-[90%] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Assistant is thinking...</span>
                  <div className="flex gap-1 ml-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></div>
                  </div>
                  <button
                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                    className="ml-auto flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  >
                    {isThinkingExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Expand
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsed View - Show only current step */}
                {!isThinkingExpanded && thinkingSteps[currentThinkingStep] && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2 bg-blue-500 animate-pulse shadow-lg shadow-blue-500/30"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                            {thinkingSteps[currentThinkingStep].title}
                          </span>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {thinkingSteps[currentThinkingStep].displayedText}
                            {!thinkingSteps[currentThinkingStep].isComplete && (
                              <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Compact Progress bar */}
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <div className="flex-1 h-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${((currentThinkingStep + 1) / thinkingSteps.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{currentThinkingStep + 1}/{thinkingSteps.length}</span>
                    </div>
                  </div>
                )}

                {/* Expanded View - Show all steps */}
                {isThinkingExpanded && (
                  <div className="space-y-4">
                    {thinkingSteps.map((step, index) => (
                      <div
                        key={index}
                        className={`transition-all duration-700 ease-out ${index <= currentThinkingStep ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-4 scale-95'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 transition-all duration-500 ${step.isComplete ? 'bg-green-500 shadow-lg shadow-green-500/30' :
                            index === currentThinkingStep ? 'bg-blue-500 animate-pulse shadow-lg shadow-blue-500/30' :
                              'bg-gray-300'
                            }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{step.title}</span>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {step.displayedText}
                                {index === currentThinkingStep && !step.isComplete && (
                                  <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Full Progress bar */}
                    <div className="mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <span>Progress:</span>
                        <div className="flex-1 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${((currentThinkingStep + 1) / thinkingSteps.length) * 100}%` }}
                          ></div>
                        </div>
                        <span>{currentThinkingStep + 1}/{thinkingSteps.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && !isThinking && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              onFocus={onTriggerApiModal}
              placeholder="Ask me about your travel plans... (e.g., 'Plan a 5-day trip to Paris with cultural focus')"
              className="flex-1"
              disabled={isThinking || isLoading}
            />
            <Button type="submit" disabled={isThinking || isLoading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      <ItineraryDisplay showContent={showOutputPanel} isThinkingComplete={isThinkingComplete} />
    </div>
  )
}
