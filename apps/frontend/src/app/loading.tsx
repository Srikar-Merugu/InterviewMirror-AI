import { AnimatedLogo } from "../components/ui/Logo";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0b] z-50">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <AnimatedLogo size="lg" text="InterviewMirror AI" />
    </div>
  );
}
