import { Hero } from "@/components/hero/Hero";
import { LayerStack } from "@/components/layers/LayerStack";
import { Pillars } from "@/components/pillars/Pillars";

export default function Home() {
  return (
    <main>
      <Hero />
      <LayerStack />
      <Pillars />
      <footer className="border-t border-white/10 px-6 py-16 text-xs text-white/40 md:px-12">
        © 2026 THEHEGEO · HUMAN-LED. AI-POWERED.
      </footer>
    </main>
  );
}
