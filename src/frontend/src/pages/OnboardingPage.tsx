import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Code2, Loader2, Terminal, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegisterOrUpdateProfile } from "../hooks/useQueries";

interface OnboardingFormData {
  displayName: string;
  leetcodeUsername: string;
  codechefUsername: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const mutation = useRegisterOrUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<OnboardingFormData>({
    defaultValues: {
      displayName: "",
      leetcodeUsername: "",
      codechefUsername: "",
    },
  });

  const STEPS = [
    {
      id: "name",
      title: "What's your name?",
      subtitle: "This is how others will see you on the platform",
      icon: User,
      field: "displayName" as const,
      placeholder: "e.g. Alice Kumar",
      label: "Display Name",
      hint: "Your name as shown to friends",
    },
    {
      id: "leetcode",
      title: "LeetCode username?",
      subtitle: "We'll fetch your solved problem stats from LeetCode",
      icon: Code2,
      field: "leetcodeUsername" as const,
      placeholder: "e.g. alice_codes",
      label: "LeetCode Username",
      hint: "From your LeetCode profile URL",
    },
    {
      id: "codechef",
      title: "CodeChef username?",
      subtitle: "We'll also pull your CodeChef stats",
      icon: ChefHat,
      field: "codechefUsername" as const,
      placeholder: "e.g. alice_chef",
      label: "CodeChef Username",
      hint: "From your CodeChef profile URL (can skip)",
    },
  ];

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleNext = async () => {
    const valid = await trigger(currentStep.field);
    if (!valid && currentStep.field !== "codechefUsername") return;
    if (isLastStep) {
      handleSubmit(onSubmit)();
    } else {
      setStep((s) => s + 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await mutation.mutateAsync({
        displayName: data.displayName.trim(),
        leetcodeUsername: data.leetcodeUsername.trim(),
        codechefUsername: data.codechefUsername.trim(),
      });
      toast.success("Profile created! Welcome to Code Tracker.");
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Terminal size={14} className="text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest uppercase">
            Code Tracker
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <currentStep.icon size={18} className="text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-primary text-sm">
                {String(step + 1).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {currentStep.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentStep.subtitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              {currentStep.label}
            </Label>
            <Input
              {...register(currentStep.field, {
                required:
                  currentStep.field !== "codechefUsername"
                    ? `${currentStep.label} is required`
                    : false,
              })}
              placeholder={currentStep.placeholder}
              className="font-mono bg-background border-border focus:border-primary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNext();
              }}
              autoFocus
            />
            {errors[currentStep.field] && (
              <p className="text-xs text-destructive font-mono">
                {errors[currentStep.field]?.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground font-mono">
              {currentStep.hint}
              {currentStep.field === "codechefUsername" &&
                " — Leave blank to skip"}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="font-mono text-xs"
              >
                ← Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={mutation.isPending}
              className="flex-1 font-mono text-xs tracking-wide"
            >
              {mutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : null}
              {isLastStep
                ? mutation.isPending
                  ? "Creating..."
                  : "Create Profile →"
                : "Next →"}
            </Button>
          </div>
        </motion.div>

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground font-mono mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
