import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <main className="container mx-auto px-2 pt-15 flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-4 py-2 px-4 text-sm gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Powered by Deep Logic Analysis
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
          Code reviews that catch what humans miss.
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Codenakama analyzes logic, security vulnerabilities, and performance
          bottlenecks in your PRs. Built for engineers who care about code
          quality.
        </p>

        <div className="flex items-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Github className="size-4" />
              Get Started with GitHub
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
