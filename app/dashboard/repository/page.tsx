"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRepositories } from "@/module/repo/use-repos";
import { RepositoryListSkeleton } from "@/module/repo/repository-skeleton";
import { useConnectRepository } from "@/module/repo/use-connect-repository";
import { fetchRepositories } from "@/module/repo";

type Repo = Awaited<ReturnType<typeof fetchRepositories>>[number];

const RepositoryPageClient = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const { mutate: connectRepo } = useConnectRepository();
  const [searchQuery, setSearchQuery] = useState("");
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null,
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filteredRepositories = useMemo(() => {
    const allRepos = data?.pages.flat() || [];
    if (!searchQuery) return allRepos;

    const query = searchQuery.toLowerCase();
    return allRepos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query),
    );
  }, [data, searchQuery]);

  const handleConnect = (repo: Repo) => {
    setLocalConnectingId(repo.id);
    connectRepo(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id,
      },
      { onSettled: () => setLocalConnectingId(null) },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and view all your GitHub repositories
          </p>
        </div>
        <RepositoryListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and view all your GitHub repositories
          </p>
        </div>
        <p className="text-destructive text-center">
          Failed to load repositories
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">Repositories</h1>
        <p className="text-muted-foreground">
          Manage and view all your GitHub repositories
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo) => (
          <Card key={repo.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <Badge variant={"outline"}>
                      {repo.language || "Unknown"}
                    </Badge>
                    {repo.isConnected && (
                      <Badge variant={"secondary"}>Connected</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {repo.description || "No description provided."}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                  <Button
                    onClick={() => handleConnect(repo)}
                    disabled={localConnectingId === repo.id || repo.isConnected}
                    variant={repo.isConnected ? "ghost" : "default"}
                  >
                    {localConnectingId === repo.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : repo.isConnected ? (
                      "Connected"
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-primary" fill="#ffe0c2" />
                  {repo.stargazers_count}
                </div>
                <div className="flex gap-2">
                  {repo.topics?.slice(0, 3).map((topic) => (
                    <span key={topic}>#{topic}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage ? (
          <RepositoryListSkeleton />
        ) : !hasNextPage && filteredRepositories.length > 0 ? (
          <p className="text-center text-muted-foreground">
            That&apos;s all the repositories you have!
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default RepositoryPageClient;
