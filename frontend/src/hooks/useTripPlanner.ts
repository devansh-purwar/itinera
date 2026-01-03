import { useState, useRef, useEffect } from "react"
import thinkingData from "@/data/thinking.json"

// Config for thinking animation
const THINKING_CONFIG = {
    typingSpeed: 10,
    stepDelay: 100,
    completionDelay: 800,
    minDisplayTime: 2000
}

export function useTripPlanner() {
    const [isThinking, setIsThinking] = useState(false)
    const [isThinkingComplete, setIsThinkingComplete] = useState(false)
    const [thinkingSteps, setThinkingSteps] = useState(thinkingData.map((step: any) => ({ ...step, displayedText: "", isComplete: false })))
    const [apiData, setApiData] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI travel planner. Where would you like to go?"
        }
    ])

    // Refs for safe access in timeouts
    const apiDataRef = useRef<any>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const thinkingTimeouts = useRef<NodeJS.Timeout[]>([])
    const typingIntervals = useRef<NodeJS.Timeout[]>([])

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

    const clearAllTimers = () => {
        thinkingTimeouts.current.forEach(clearTimeout)
        thinkingTimeouts.current = []
        typingIntervals.current.forEach(clearInterval)
        typingIntervals.current = []
    }

    const stopThinking = () => {
        setIsThinking(false)
        clearAllTimers()
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setMessages((prev: any[]) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: "🛑 Generation stopped by user."
        }])
    }

    const parseUserQuery = (query: string) => {
        // Simplified parsing logic (can be moved to utility)
        const daysMatch = query.match(/(\d+)\s*(?:days|day)/i)
        const fromMatch = query.match(/from\s+([a-zA-Z\s]+?)(?:\s+to|\s+for|\s+in|\s*$)/i)

        let homeCity = "New Delhi"
        if (fromMatch && fromMatch[1]) homeCity = fromMatch[1].trim()

        const queryWithoutFrom = query.replace(/from\s+[a-zA-Z\s]+/i, "")
        const destMatch = queryWithoutFrom.match(/(?:to|visit|in|plan for|create for|for|trip to)\s+([a-zA-Z\s]+?)(?:\s+\d+\s*days|\s*$)/i)

        let destination = "Shimla"
        if (destMatch && destMatch[1]) {
            const raw = destMatch[1].trim()
            if (raw.toLowerCase() !== "itinerary") destination = raw
        } else {
            // Check implicit "Coorg" in "Create itinerary for Coorg"
            const formatMatch = query.match(/for\s+([a-zA-Z\s]+)/i)
            if (formatMatch) destination = formatMatch[1].replace(/from.*/i, "").trim()
        }

        return {
            home_city: homeCity,
            destination_city: destination,
            num_days: daysMatch ? parseInt(daysMatch[1]) : 5,
            interests: ["culture", "food", "sightseeing"]
        }
    }

    const fetchItinerary = async (query: string) => {
        try {
            const payload = parseUserQuery(query)
            console.log("Fetching for:", payload)

            const controller = new AbortController()
            abortControllerRef.current = controller

            const response = await fetch(`${API_URL}/api/v1/itinera/planner/itinerary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            })

            if (!response.ok) throw new Error("API failed")

            const data = await response.json()
            setApiData(data)
            apiDataRef.current = data
            return data
        } catch (error) {
            console.error(error)
            return null
        }
    }

    const startThinkingProcess = (onComplete: () => void) => {
        setIsThinking(true)
        setIsThinkingComplete(false)
        setApiData(null)
        apiDataRef.current = null

        // Reset steps
        setThinkingSteps(thinkingData.map((s: any) => ({ ...s, displayedText: "", isComplete: false })))

        const processStep = (stepIndex: number) => {
            if (stepIndex >= thinkingData.length) {
                // Wait for data
                if (!apiDataRef.current) {
                    const t = setTimeout(() => processStep(stepIndex), 500)
                    thinkingTimeouts.current.push(t)
                    return
                }

                // Complete
                setThinkingSteps((prev: any[]) => prev.map((s: any) => ({ ...s, isComplete: true })))
                const t = setTimeout(() => {
                    setIsThinking(false)
                    setIsThinkingComplete(true)
                    onComplete()
                }, THINKING_CONFIG.completionDelay)
                thinkingTimeouts.current.push(t)
                return
            }

            // Animate current step
            const step = thinkingData[stepIndex]
            let charIndex = 0

            const typeInterval = setInterval(() => {
                if (charIndex <= step.description.length) {
                    setThinkingSteps((prev: any[]) => prev.map((s: any, i: number) =>
                        i === stepIndex ? { ...s, displayedText: step.description.slice(0, charIndex) } : s
                    ))
                    charIndex++
                } else {
                    clearInterval(typeInterval)
                    // Move to next step
                    const t = setTimeout(() => {
                        setThinkingSteps((prev: any[]) => prev.map((s: any, i: number) =>
                            i === stepIndex ? { ...s, isComplete: true } : s
                        ))
                        processStep(stepIndex + 1)
                    }, THINKING_CONFIG.minDisplayTime)
                    thinkingTimeouts.current.push(t)
                }
            }, THINKING_CONFIG.typingSpeed)

            typingIntervals.current.push(typeInterval)
        }

        processStep(0)
    }

    return {
        isThinking,
        isThinkingComplete,
        thinkingSteps,
        apiData,
        messages,
        setMessages,
        startThinkingProcess,
        stopThinking,
        fetchItinerary
    }
}
