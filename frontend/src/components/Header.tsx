import { Button } from "@/components/ui/button"
import { Globe, MessageSquare, Mic, ChevronDown, Sparkles } from "lucide-react"

interface Language {
    code: string
    name: string
    flag: string
}

interface HeaderProps {
    activeMode: "text" | "audio"
    setActiveMode: (mode: "text" | "audio") => void
    languages: Language[]
    selectedLanguage: string
    setSelectedLanguage: (code: string) => void
    isDropdownOpen: boolean
    setIsDropdownOpen: (open: boolean) => void
}

export function Header({
    activeMode, setActiveMode, languages,
    selectedLanguage, setSelectedLanguage,
    isDropdownOpen, setIsDropdownOpen
}: HeaderProps) {
    const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]

    return (
        <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
            <div className="container mx-auto px-6 h-18 flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Itinera AI
                        </h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Travel Planner</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-muted/50 p-1 rounded-2xl flex items-center gap-1 border border-border/50">
                        <Button
                            variant={activeMode === "text" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveMode("text")}
                            className={`gap-2 rounded-xl transition-all ${activeMode === "text" ? "shadow-md" : ""}`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Chat</span>
                        </Button>
                        <Button
                            variant={activeMode === "audio" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveMode("audio")}
                            className={`gap-2 rounded-xl transition-all ${activeMode === "audio" ? "shadow-md" : ""}`}
                        >
                            <Mic className="w-4 h-4" />
                            <span className="hidden sm:inline">Voice</span>
                        </Button>
                    </div>

                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="gap-2 rounded-xl border-border/50 hover:bg-muted/30 min-w-[130px]"
                        >
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </Button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border/50 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLanguage(lang.code)
                                            setIsDropdownOpen(false)
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 flex items-center gap-3 transition-colors ${selectedLanguage === lang.code ? 'text-primary font-semibold bg-primary/5' : ''
                                            }`}
                                    >
                                        <span className="text-base">{lang.flag}</span>
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
