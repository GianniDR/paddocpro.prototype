import { HorseIcon } from "@/components/icons";

export default function Home() {
  return (
    <main
      className="min-h-svh flex items-center justify-center bg-background"
      data-testid="boot-smoke-home"
    >
      <div className="flex items-center gap-3">
        <HorseIcon size={36} className="text-primary" />
        <h1 className="text-4xl font-display italic font-semibold tracking-normal">
          paddoc <span className="text-primary">|</span> pro
        </h1>
      </div>
    </main>
  );
}
