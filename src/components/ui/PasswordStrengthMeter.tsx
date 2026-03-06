import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PasswordStrengthMeterProps {
    password: string;
    className?: string;
}

export function getPasswordStrength(pass: string): number {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
}

const STRENGTH_CONFIG = [
    { label: "", color: "bg-zinc-800", textColor: "text-zinc-600" },
    { label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
    { label: "Fair", color: "bg-orange-500", textColor: "text-orange-500" },
    { label: "Good", color: "bg-yellow-500", textColor: "text-yellow-500" },
    { label: "Strong", color: "bg-green-500", textColor: "text-green-500" },
] as const;

const REQUIREMENTS = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Number (0–9)", test: (p: string) => /[0-9]/.test(p) },
    { label: "Special character (!@#…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
    const strength = getPasswordStrength(password);
    const config = STRENGTH_CONFIG[strength];

    if (!password) return null;

    return (
        <div className={cn("space-y-3 pt-1", className)}>
            {/* Bar header */}
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Security Level
                </span>
                <span className={cn("text-[10px] font-black uppercase tracking-widest", config.textColor)}>
                    {config.label}
                </span>
            </div>

            {/* Segmented bar */}
            <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={cn(
                            "flex-1 rounded-full transition-all duration-500",
                            strength >= step ? config.color : "bg-zinc-800"
                        )}
                    />
                ))}
            </div>

            {/* Requirements checklist */}
            <div className="grid grid-cols-1 gap-1 pt-1">
                {REQUIREMENTS.map((req) => {
                    const passed = req.test(password);
                    return (
                        <div key={req.label} className="flex items-center gap-2">
                            {passed ? (
                                <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                            ) : (
                                <AlertCircle size={11} className="text-zinc-600 shrink-0" />
                            )}
                            <span className={cn(
                                "text-[10px] font-medium italic",
                                passed ? "text-zinc-400" : "text-zinc-600"
                            )}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Error Message if strength is less than Good (3) */}
            {strength < 3 && (
                <div className="pt-2">
                    <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />Password is too weak. It must be at least 'Good' strength.
                    </p>
                </div>
            )}
        </div>
    );
}

