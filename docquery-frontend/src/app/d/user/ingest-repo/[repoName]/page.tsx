"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IngestionProgress } from "@/components/ingestion-progess";
import {
  ArrowRight,
  Loader2,
  GitBranch,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { IngestionAgentState } from "@/lib/types";
import { GitHubRepoFiles } from "@/components/github-repo-files";
import { useFeatureFlags } from "@/components/flagsmith/flagsmith-wrapper";

export default function IngestRepoPage() {
  const { disable_ingestion, max_files_limit } = useFeatureFlags();

  const { data: session } = useSession();
  const params = useParams();
  const repoName = params.repoName as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [repository, setRepository] = useState<any>(null);
  const [error, setError] = useState("");

  // Add new state for ingestion functionality
  const [branchInput, setBranchInput] = useState("main");
  const [repoFiles, setRepoFiles] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Initialize the Copilot agent for ingestion
  const { state, setState, run } = useCoAgent<IngestionAgentState>({
    name: "ingestion_agent",
    initialState: {
      repo: null,
      error: null,
      total_files: 0,
      files_ingested: 0,
      status: "PENDING",
    },
  });

  const { toast } = useToast();

  // Original repository ownership check
  useEffect(() => {
    async function checkRepoOwnership() {
      try {
        // Get GitHub username from session
        const githubUsername = session?.user?.githubUsername;

        if (!githubUsername) {
          setError("GitHub username not found in session");
          setIsLoading(false);
          return;
        }

        // Fetch specific repository information
        const response = await fetch(
          `https://api.github.com/repos/${githubUsername}/${repoName}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            setIsOwner(false);
            setIsLoading(false);
            return;
          }
          throw new Error(
            `GitHub API responded with ${response.status}: ${await response.text()}`,
          );
        }

        const repoData = await response.json();

        // Check if repository is not forked
        if (!repoData.fork) {
          setRepository(repoData);
          setIsOwner(true);

          // Automatically fetch files from default branch
          fetchRepoFiles(githubUsername, repoName, "main");
        } else {
          setIsOwner(false);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching repository information");
      } finally {
        setIsLoading(false);
      }
    }

    checkRepoOwnership();
  }, [session, repoName]);

  // Update agent state when files are selected
  useEffect(() => {
    if (repository && selectedFiles.size && session?.user?.githubUsername) {
      setState({
        repo: {
          name: repository.name,
          full_name: `${session.user.githubUsername}/${repository.name}`,
          files_path: Array.from(selectedFiles),
          repository_url: repository.html_url,
          branch: branchInput,
          user_email: session.user.email as string,
        },
        error: null,
        status: "PENDING",
        total_files: selectedFiles.size,
        files_ingested: 0,
      });
    }
  }, [selectedFiles, repository, branchInput, session]);

  // Handle successful ingestion
  useEffect(() => {
    if (
      state.status === "COMPLETED" &&
      repository?.name &&
      session?.user?.githubUsername
    ) {
      toast({
        title: "Repository Ingested Successfully!",
        description: `You can now start chatting with ${repository.name}`,
        action: (
          <ToastAction altText="Navigate to chat">
            <Link
              href={`/d/chat/owner/${session.user.githubUsername}/repo/${repository.name}`}
              className="flex items-center gap-2"
            >
              Start Chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ToastAction>
        ),
      });
    }
  }, [state.status, repository, session]);

  // Function to fetch repository files for a branch
  const fetchRepoFiles = async (
    owner: string,
    repo: string,
    branch: string,
  ) => {
    setRepoFiles([]);
    setSelectedFiles(new Set());
    setLoadingFiles(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1000`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch repository files from branch '${branch}'`,
        );
      }

      const data = (await response.json()) as { tree: { path: string }[] };
      const filePaths = data.tree
        .filter(
          (file) =>
            !file.path.startsWith(".") &&
            /\.mdx?$/.test(file.path) &&
            !/\/\./.test(file.path),
        )
        .map((file) => file.path);

      setRepoFiles(filePaths);
    } catch (err: any) {
      setError(err.message || "Error fetching repository files");
    } finally {
      setLoadingFiles(false);
    }
  };

  // Function to handle branch selection
  const handleBranchSubmit = () => {
    if (repository && session?.user?.githubUsername) {
      fetchRepoFiles(session.user.githubUsername, repository.name, branchInput);
    }
  };

  // Function to start ingestion
  const runIngestion = () => {
    setState({
      ...state,
      status: "RUNNING",
      files_ingested: 0,
    });
    run();
  };

  if (disable_ingestion) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ingestion Disabled</h1>
        <p>
          The ingestion feature is currently disabled. Please contact the
          administrator for more information.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  // Not owner state
  if (!isOwner) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Repository Not Found</h1>
        <p>
          The repository &quot;{repoName}&quot; does not belong to your account
          or is not eligible for ingestion.
        </p>
        <p>Repositories must be:</p>
        <ul className="list-disc ml-8 mt-2">
          <li>Created by you (not forked)</li>
          <li>Public repositories</li>
        </ul>
      </div>
    );
  }

  // Owner state with ingestion UI
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ingest Repository: {repoName}</h1>

      {repository && (
        <div className="mb-6 bg-white p-4 rounded-md border">
          <div className="flex items-center mb-2">
            <div className="font-medium text-lg">{repository.name}</div>
            {repository.private && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Private
              </span>
            )}
          </div>
          {repository.description && (
            <div className="text-gray-600 mb-2">{repository.description}</div>
          )}
          <div className="text-sm text-gray-500">
            Last updated: {new Date(repository.updated_at).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Branch Selection */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="branch-input" className="text-sm font-medium">
              Branch Name
            </Label>
          </div>

          <div className="flex gap-2">
            <Input
              id="branch-input"
              placeholder="Enter branch name (e.g., main, develop, feature/docs)"
              value={branchInput}
              onChange={(e) => setBranchInput(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleBranchSubmit}
              disabled={!branchInput || loadingFiles}
              variant="outline"
            >
              {loadingFiles ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Load Files"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the exact branch name containing the documentation files you
            want to ingest.
          </p>
        </div>

        {loadingFiles && (
          <div className="flex items-center justify-center gap-2 py-4 mt-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading files from branch &#39;{branchInput}&#39;...
            </p>
          </div>
        )}
      </Card>

      {/* File Selection with GitHubRepoFiles component */}
      {repoFiles.length > 0 && (
        <div className="mb-6">
          <GitHubRepoFiles
            paths={repoFiles}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            maxFilesLimit={max_files_limit}
          />
        </div>
      )}

      {/* Ingestion Progress */}
      <div className="space-y-4 mb-6">
        <IngestionProgress
          status={state.status}
          total_files={state.total_files}
          files_ingested={state.files_ingested}
          error={state.error}
        />

        {selectedFiles.size > 0 && (
          <div className="mt-4">
            <div className="text-sm mb-2">
              <span className="font-medium">Current Branch: </span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                {branchInput}
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={runIngestion}
              disabled={state.status === "RUNNING"}
            >
              {state.status === "RUNNING" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingestion in progress...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Ingesting {selectedFiles.size} files
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
