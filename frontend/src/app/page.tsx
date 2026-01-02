"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Mic, Globe, ChevronDown, Key, AlertCircle } from "lucide-react"
import ChatInterface from "@/components/ChatInterface"
import VoiceInterface from "@/components/VoiceInterface"

export default function TravelPlannerApp() {
  const [activeMode, setActiveMode] = useState<"text" | "audio">("text")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [mapsApiKey, setMapsApiKey] = useState("")
  const [showError, setShowError] = useState(false)

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" }
  ]

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle API key submission
  const handleProceed = () => {
    setShowError(true)
  }

  // Function to trigger the API modal
  const triggerApiModal = () => {
    setShowApiModal(true)
    setShowError(false) // Reset error when opening modal
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* API Keys Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Required API Keys</h2>
                  <p className="text-sm text-muted-foreground">Please enter your API keys to continue</p>
                </div>
              </div>

              {showError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive">Unexpected key format</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="gemini-key" className="block text-sm font-medium text-foreground mb-2">
                    Google Gemini API Key
                  </label>
                  <Input
                    id="gemini-key"
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="maps-key" className="block text-sm font-medium text-foreground mb-2">
                    Google Maps API Key
                  </label>
                  <Input
                    id="maps-key"
                    type="password"
                    placeholder="Enter your Maps API key"
                    value={mapsApiKey}
                    onChange={(e) => setMapsApiKey(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleProceed}
                  className="w-full"
                  disabled={!geminiApiKey.trim() || !mapsApiKey.trim()}
                >
                  Proceed
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Your API keys are required to access AI features and maps functionality
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Itinera AI</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={false ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveMode("text")}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Text Chat
              </Button>
              <Button
                variant={true ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveMode("audio")}
                className="gap-2"
              >
                <Mic className="w-4 h-4" />
                Voice Chat
              </Button>

              {/* Language Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="gap-2 min-w-[120px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{currentLanguage.flag}</span>
                    <span className="text-sm">{currentLanguage.name}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            setSelectedLanguage(language.code)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors ${selectedLanguage === language.code ? 'bg-accent text-accent-foreground' : ''
                            }`}
                        >
                          <span className="text-sm">{language.flag}</span>
                          <span className="text-sm">{language.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        {activeMode === "text" ? (
          <ChatInterface onTriggerApiModal={triggerApiModal} />
        ) : (
          <VoiceInterface onTriggerApiModal={triggerApiModal} />
        )}
      </main>
    </div>
  )
}
