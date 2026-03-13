"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";
import {
  BrainCircuit,
  GitGraph,
  GithubIcon,
  ShieldAlert,
  Code,
} from "lucide-react";
import { useState } from "react";

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({ provider: "github", callbackURL: "/dashboard" });
    } catch (error) {
      console.error("GitHub login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 bg-white rounded-lg flex items-center justify-center">
              <Code className="text-black size-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">
              CodeNakama
            </span>
          </div>
          <Badge variant="secondary" className="uppercase tracking-wider">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            logic-aware AI Review System
          </Badge>
        </div>

        <Card className="rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2 tracking-tight">
              Welcome to CodeNakama
            </h1>
            <p className="text-muted-foreground text-sm">
              Connect your GitHub account to start reviewing PRs.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full h-12 font-semibold text-base rounded-xl"
            >
              <GithubIcon className="size-5" />
              {isLoading ? "Signing in..." : "Continue with GitHub"}
            </Button>

            <p className="text-xs text-center text-muted-foreground px-6">
              By clicking continue, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>

          <div className="mt-4 pt-8 border-t space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md border bg-white/5">
                <BrainCircuit className="size-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs font-medium">Semantic Logic Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Understand codebase context and architectural flaws.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md border bg-white/5">
                <GitGraph className="size-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium">Architectural Mapping</p>
                <p className="text-xs text-muted-foreground">
                  Automated sequence diagrams and logic summaries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md border bg-white/5">
                <ShieldAlert className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-medium">Smart Issue Detection</p>
                <p className="text-xs text-muted-foreground">
                  Find plausible security risks and suggest bug fixes.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          Modern code intelligence for high-stakes teams.
        </p>
      </div>
    </div>
  );
};

export default LoginUI;
