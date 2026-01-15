"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  isBranchSelectorOpen: boolean;
  openBranchSelector: () => void;
  closeBranchSelector: () => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  // Always initialize as null to avoid hydration mismatch
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBranch = localStorage.getItem("selectedBranch");
      if (savedBranch) {
        try {
          setSelectedBranchState(JSON.parse(savedBranch));
        } catch (error) {
          // Silently handle parse error
        }
      }
    }
  }, []);

  const setSelectedBranch = React.useCallback((branch: Branch | null) => {
    setSelectedBranchState(branch);
    if (typeof window !== "undefined") {
      if (branch) {
        localStorage.setItem("selectedBranch", JSON.stringify(branch));
      } else {
        localStorage.removeItem("selectedBranch");
      }
    }
  }, []);

  const openBranchSelector = React.useCallback(() => setIsBranchSelectorOpen(true), []);
  const closeBranchSelector = React.useCallback(() => setIsBranchSelectorOpen(false), []);

  const value = useMemo(
    () => ({
      selectedBranch,
      setSelectedBranch,
      isBranchSelectorOpen,
      openBranchSelector,
      closeBranchSelector,
    }),
    [selectedBranch, setSelectedBranch, isBranchSelectorOpen, openBranchSelector, closeBranchSelector]
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};
