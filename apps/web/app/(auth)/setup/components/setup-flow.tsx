"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

import StepWhatsapp from "./step-whatsapp";
import StepVerify from "./step-verify";
import StepEmail from "./step-email";
import StepDone from "./step-done";

export default function SetupFlow() {
  const [step, setStep] = useState(1);

  return (
    <Card className="w-full max-w-md p-6">

    

 {/* DEBUG NAV (temporal) quitar al conectar los steps*/}
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className="text-xs px-2 py-1 border rounded"
          >
            Step {s}
          </button>
        ))}
      </div>



      {step === 1 && <StepWhatsapp />}
      {step === 2 && <StepVerify />}
      {step === 3 && <StepEmail />}
      {step === 4 && <StepDone />}
    </Card>
  );
}