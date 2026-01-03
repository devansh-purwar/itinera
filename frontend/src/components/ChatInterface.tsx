import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, BotMessageSquare } from "lucide-react"
import { useState } from "react"
import ItineraryDisplay from "./ItineraryDisplay"
import { useTripPlanner } from "@/hooks/useTripPlanner"
import { ThinkingProcess } from "./itinerary/ThinkingProcess"

interface TextChatInterfaceProps {
  onTriggerApiModal: () => void
}

export default function ChatInterface({ onTriggerApiModal }: TextChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [showOutputPanel, setShowOutputPanel] = useState(false)

  const {
    isThinking,
    isThinkingComplete,
    thinkingSteps,
    apiData,
    messages,
    setMessages,
    startThinkingProcess,
    stopThinking,
    fetchItinerary
  } = useTripPlanner()

  // Find the current active thinking step
  const currentThinkingStep = thinkingSteps.findIndex((s: any) => !s.isComplete)
  const activeStepIndex = currentThinkingStep === -1 ? thinkingSteps.length - 1 : currentThinkingStep

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim()
    }

    setMessages((prev: any[]) => [...prev, userMessage])
    const query = input.trim()
    setInput('')
    setShowOutputPanel(false)

    // Trigger AI process
    fetchItinerary(query)
    startThinkingProcess(() => {
      setShowOutputPanel(true)
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4 lg:p-0">
      {/* Chat Panel */}
      <Card className="flex flex-col gradient-card border-border shadow-xl rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-border bg-card/50">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BotMessageSquare className="w-5 h-5 text-primary" />
            Itinera AI Assistant
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message: any) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-muted-foreground rounded-tl-none border border-border/50"
                }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Thinking Animation Component */}
          <ThinkingProcess
            isThinking={isThinking}
            thinkingSteps={thinkingSteps}
            currentThinkingStep={activeStepIndex}
            onStop={stopThinking}
          />
        </div>

        <div className="p-4 border-t border-border bg-card/30">
          <form onSubmit={handleSubmit} className="flex gap-2 bg-background/50 p-1 rounded-xl border border-border focus-within:ring-2 ring-primary/20 transition-all">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Where is your next adventure?"
              className="flex-1 border-none bg-transparent focus-visible:ring-0"
              disabled={isThinking}
            />
            <Button type="submit" disabled={isThinking || !input.trim()} size="icon" className="rounded-lg shadow-lg">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Output Panel */}
      <div className="h-full">
        <ItineraryDisplay
          showContent={showOutputPanel}
          isThinkingComplete={isThinkingComplete}
          itineraryData={apiData}
        />
      </div>
    </div>
  )
}
