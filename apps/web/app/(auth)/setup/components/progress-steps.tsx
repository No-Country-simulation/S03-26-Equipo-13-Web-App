type Props = {
  step: number;
};

export default function ProgressSteps({ step }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          
          <div
            className={`
              w-6 h-6 flex items-center justify-center rounded-full text-xs
              ${step === s ? "bg-[var(--brand)] text-white" : ""}
              ${step > s ? "bg-green-500 text-white" : "bg-gray-200"}
            `}
          >
            {step > s ? "✓" : s}
          </div>

          {s < 3 && <div className="w-6 h-[2px] bg-gray-300" />}
        </div>
      ))}
    </div>
  );
}