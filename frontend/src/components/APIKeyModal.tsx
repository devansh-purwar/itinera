import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key, AlertCircle } from "lucide-react"

interface APIKeyModalProps {
    isOpen: boolean
    geminiKey: string
    mapsKey: string
    showError: boolean
    onGeminiKeyChange: (val: string) => void
    onMapsKeyChange: (val: string) => void
    onProceed: () => void
}

export function APIKeyModal({
    isOpen, geminiKey, mapsKey, showError,
    onGeminiKeyChange, onMapsKeyChange, onProceed
}: APIKeyModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Key className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">API Keys</h2>
                            <p className="text-sm text-muted-foreground">Setup required credentials</p>
                        </div>
                    </div>

                    {showError && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <span className="text-sm font-medium text-destructive">Unexpected key format</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Gemini API Key</label>
                            <Input
                                type="password"
                                placeholder="sk-..."
                                value={geminiKey}
                                onChange={(e) => onGeminiKeyChange(e.target.value)}
                                className="rounded-xl border-border/50 bg-muted/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80">Maps API Key</label>
                            <Input
                                type="password"
                                placeholder="Enter Google Maps key"
                                value={mapsKey}
                                onChange={(e) => onMapsKeyChange(e.target.value)}
                                className="rounded-xl border-border/50 bg-muted/30"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onProceed}
                        className="w-full mt-8 h-12 rounded-xl text-md font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={!geminiKey.trim() || !mapsKey.trim()}
                    >
                        Start Planning
                    </Button>
                </div>
            </div>
        </div>
    )
}
