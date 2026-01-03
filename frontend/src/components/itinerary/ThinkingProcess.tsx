import { Brain, ChevronUp, ChevronDown, Lightbulb } from "lucide-react"
import { useState, useEffect } from "react"

interface ThinkingStep {
    title: string
    description: string
    displayedText: string
    isComplete: boolean
}

interface ThinkingProcessProps {
    isThinking: boolean
    thinkingSteps: ThinkingStep[]
    currentThinkingStep: number
    onStop: () => void
}

export function ThinkingProcess({ isThinking, thinkingSteps, currentThinkingStep, onStop }: ThinkingProcessProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    // Auto-collapse after a few steps
    useEffect(() => {
        if (currentThinkingStep >= 2 && isExpanded) {
            const timeout = setTimeout(() => setIsExpanded(false), 3000)
            return () => clearTimeout(timeout)
        }
    }, [currentThinkingStep, isExpanded])

    if (!isThinking) return null

    return (
        <div className="flex justify-start">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-[90%] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Assistant is thinking...</span>

                    <div className="flex gap-1 ml-2">
                        {[0, 150, 300].map((delay) => (
                            <div
                                key={delay}
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
                            ></div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-auto flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    >
                        {isExpanded ? <><ChevronUp className="w-3 h-3" /> Collapse</> : <><ChevronDown className="w-3 h-3" /> Expand</>}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onStop(); }}
                        className="ml-2 bg-red-100 hover:bg-red-200 text-red-600 px-2 py-0.5 rounded text-xs font-medium transition-colors"
                    >
                        Stop
                    </button>
                </div>

                {/* Dynamic content */}
                {isExpanded ? (
                    <div className="space-y-4">
                        {thinkingSteps.map((step, index) => (
                            <div
                                key={index}
                                className={`transition-all duration-700 ease-out ${index <= currentThinkingStep ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 transition-all duration-500 ${step.isComplete ? 'bg-green-500 shadow-lg shadow-green-500/30' :
                                            index === currentThinkingStep ? 'bg-blue-500 animate-pulse shadow-lg shadow-blue-500/30' : 'bg-gray-300'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{step.title}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {step.displayedText}
                                                {index === currentThinkingStep && !step.isComplete && <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    thinkingSteps[currentThinkingStep] && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2 bg-blue-500 animate-pulse"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{thinkingSteps[currentThinkingStep].title}</p>
                                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-200/50 dark:border-gray-700/50">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{thinkingSteps[currentThinkingStep].displayedText}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <div className="flex-1 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${((currentThinkingStep + 1) / thinkingSteps.length) * 100}%` }}
                            ></div>
                        </div>
                        <span>{currentThinkingStep + 1}/{thinkingSteps.length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
