import { useState, useEffect, useRef } from "react"
import ChatInterface from "@/components/ChatInterface"
import VoiceInterface from "@/components/VoiceInterface"
import { Header } from "@/components/Header"
import { APIKeyModal } from "@/components/APIKeyModal"

const LANGUAGES = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
]

export default function App() {
    const [activeMode, setActiveMode] = useState<"text" | "audio">("text")
    const [selectedLanguage, setSelectedLanguage] = useState("en")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showApiModal, setShowApiModal] = useState(false)

    // Keys - Vite uses import.meta.env.VITE_... 
    // For compatibility with previous setup, we'll try to handle both or just use standard
    const geminiEnv = import.meta.env.VITE_GEMINI_API_KEY || "backend-managed"
    const mapsEnv = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""

    const [geminiApiKey, setGeminiApiKey] = useState(geminiEnv)
    const [mapsApiKey, setMapsApiKey] = useState(mapsEnv)
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        // Initial check for keys - Only show if maps key is missing.
        // We trust gemini is backend-managed or in env.
        if (!mapsEnv) {
            // setShowApiModal(true) // Disable auto-popup for better UX
        }

        // Add dark class to html for tailwind
        document.documentElement.classList.add('dark')
    }, [])

    const handleProceed = () => {
        setShowApiModal(false)
    }

    const triggerApiModal = () => setShowApiModal(true)

    return (
        <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#0D0D0F] transition-colors duration-500 text-foreground">
            <APIKeyModal
                isOpen={showApiModal}
                geminiKey={geminiApiKey}
                mapsKey={mapsApiKey}
                showError={showError}
                onGeminiKeyChange={setGeminiApiKey}
                onMapsKeyChange={setMapsApiKey}
                onProceed={handleProceed}
            />

            <Header
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                languages={LANGUAGES}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
            />

            <main className="container mx-auto px-4 lg:px-8 py-8 h-[calc(100vh-72px)] overflow-hidden">
                <div className="h-full animate-in fade-in duration-1000">
                    {activeMode === "text" ? (
                        <ChatInterface onTriggerApiModal={triggerApiModal} />
                    ) : (
                        <VoiceInterface onTriggerApiModal={triggerApiModal} />
                    )}
                </div>
            </main>
        </div>
    )
}
