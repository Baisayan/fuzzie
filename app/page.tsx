import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";

export default function Hero() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-2 flex flex-col items-center mt-10 md:mt-15 text-center">
        <Badge variant="secondary" className="mb-4 py-2 px-4 text-sm gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Powered by Deep Logic Analysis
        </Badge>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">
          Code reviews that catch what humans miss
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-2 mb-10 tracking-wide">
          CodeNakama analyzes logic, security vulnerabilities, and performance
          bottlenecks in your PRs. Built for engineers who care about code
          quality.
        </p>

        <div className="flex items-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard" className="font-semibo">
              <Github className="size-4" />
              Get Started for Free
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Explore Features
          </Button>
        </div>
      </main>
    </div>
  );
}
