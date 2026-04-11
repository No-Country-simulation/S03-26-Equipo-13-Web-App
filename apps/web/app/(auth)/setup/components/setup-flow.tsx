"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

import StepWhatsapp from "./step-whatsapp";
import StepVerify from "./step-verify";
import StepEmail from "./step-email";
import StepDone from "./step-done";

export default function SetupFlow() {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Card className="w-full max-w-md p-6">
      {step === 1 && <StepWhatsapp onNext={next} />}
      {step === 2 && <StepVerify onNext={next} onBack={back} />}
      {step === 3 && <StepEmail onNext={next} />}
      {step === 4 && <StepDone />}
    </Card>
  );
}
