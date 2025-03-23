"use client";

import React, { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, File, ChevronUp } from "lucide-react";
import { parseFileTree, FileNode, getAllDescendantPaths } from "@/lib/fileTree";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface GitHubRepoFilesProps {
  paths: string[];
  selectedFiles: Set<string>;
  setSelectedFiles: (files: React.SetStateAction<Set<string>>) => void;
  maxFilesLimit?: number | null;
}

const FileTreeNode: React.FC<{
  node: FileNode;
  selectedFiles: Set<string>;
  onFileSelect: (path: string, isChecked: boolean) => void;
  level: number;
  maxFilesLimit?: number | null;
}> = ({ node, selectedFiles, onFileSelect, level, maxFilesLimit }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const allDescendantPaths = getAllDescendantPaths(node);
  const allDescendantsSelected = allDescendantPaths.every((path) =>
    selectedFiles.has(path),
  );
  const someDescendantsSelected = allDescendantPaths.some((path) =>
    selectedFiles.has(path),
  );

  const handleCheckboxChange = (checked: boolean) => {
    if (node.isDirectory) {
      const descendantPaths = getAllDescendantPaths(node);

      // Check if adding these paths would exceed the limit
      if (checked && maxFilesLimit) {
        const newFilesCount = descendantPaths.filter(path => !selectedFiles.has(path)).length;
        if (selectedFiles.size + newFilesCount > maxFilesLimit) {
          // Just return without showing toast or updating state
          return;
        }
      }
      descendantPaths.forEach((path) => onFileSelect(path, checked));
    } else {
      onFileSelect(node.path, checked);
    }
  };

  return (
    <div className="flex items-start min-w-fit">
      <div style={{ width: `${level * 16}px` }} className="flex-shrink-0"></div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center space-x-1 py-1">
          {node.isDirectory ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 flex-shrink-0"
              onClick={handleToggle}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <File className="h-4 w-4 text-muted-foreground ml-1 flex-shrink-0" />
          )}
          <Checkbox
            id={node.path}
            checked={allDescendantsSelected}
            onCheckedChange={handleCheckboxChange}
            className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground flex-shrink-0"
            {...(someDescendantsSelected && !allDescendantsSelected
              ? { "data-state": "indeterminate" }
              : {})}
          />
          <label
            htmlFor={node.path}
            className="text-sm cursor-pointer select-none whitespace-nowrap"
          >
            {node.name}
          </label>
        </div>
        {node.isDirectory &&
          isOpen &&
          node.children?.map((child, index) => (
            <FileTreeNode
              key={index}
              node={child}
              selectedFiles={selectedFiles}
              onFileSelect={onFileSelect}
              level={level + 1}
              maxFilesLimit={maxFilesLimit}
            />
          ))}
      </div>
    </div>
  );
};

export function GitHubRepoFiles({
  paths,
  selectedFiles,
  setSelectedFiles,
  maxFilesLimit
}: GitHubRepoFilesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileTree = parseFileTree(paths);
  const { toast } = useToast();
  const limitExceededRef = useRef(false);

  // Use this effect to show toast when limit is exceeded
  useEffect(() => {
    if (limitExceededRef.current) {
      toast({
        title: "File limit reached",
        description: `You can only select up to ${maxFilesLimit} files.`,
        variant: "destructive",
      });
      limitExceededRef.current = false;
    }
  }, [toast, maxFilesLimit, selectedFiles]);

  const handleFileSelect = (path: string, isChecked: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        // Check file limit before adding
        if (!maxFilesLimit || newSet.size < maxFilesLimit) {
          newSet.add(path);
        } else {
          // Set the ref to true to trigger the toast in the effect
          limitExceededRef.current = true;
          return prev; // Return original set without changes
        }
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <Card className="w-full transition-all hover:shadow-lg">
      <div
        className="p-4 border-b flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h2 className="text-lg font-semibold flex items-center flex-wrap gap-4">
          <span>Repository Files</span>
          {!selectedFiles.size && (
            <span className="text-sm text-muted-foreground">
              (Select files to ingest)
            </span>
          )}
          {maxFilesLimit && (
            <span className="text-sm">
              <span className={selectedFiles.size >= maxFilesLimit ? "text-red-500 font-medium" : "text-muted-foreground"}>
                {selectedFiles.size}
              </span>
              <span className="text-muted-foreground"> / {maxFilesLimit} files selected</span>
            </span>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isExpanded ? "Collapse" : "Expand"} repository files
          </span>
        </Button>
      </div>
      {isExpanded && (
        <>
          {maxFilesLimit && selectedFiles.size >= maxFilesLimit && (
            <div className="bg-red-50 border-b border-red-200 p-3">
              <p className="text-sm text-red-700">
                Maximum file limit reached ({maxFilesLimit} files). Deselect some files to add more.
              </p>
            </div>
          )}
          <div
            className={cn("h-[400px] w-full custom-scrollbar", "overflow-auto")}
          >
            <div className="p-4 min-w-fit">
              {fileTree.map((node, index) => (
                <FileTreeNode
                  key={index}
                  node={node}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                  level={0}
                  maxFilesLimit={maxFilesLimit}
                />
              ))}
            </div>
          </div>
          <div className="p-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Selected Files:</h3>
            <div
              className={cn(
                "h-[100px] w-full custom-scrollbar",
                "overflow-auto",
              )}
            >
              <ul className="text-sm min-w-fit">
                {Array.from(selectedFiles).map((file) => (
                  <li key={file} className="py-1 whitespace-nowrap">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}