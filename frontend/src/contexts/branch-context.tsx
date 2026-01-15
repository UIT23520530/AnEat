"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);

  // Load selected branch from localStorage on mount
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

  const setSelectedBranch = (branch: Branch | null) => {
    setSelectedBranchState(branch);
    if (typeof window !== "undefined") {
      if (branch) {
        localStorage.setItem("selectedBranch", JSON.stringify(branch));
      } else {
        localStorage.removeItem("selectedBranch");
      }
    }
  };

  const openBranchSelector = () => setIsBranchSelectorOpen(true);
  const closeBranchSelector = () => setIsBranchSelectorOpen(false);

  return (
    <BranchContext.Provider
      value={{
        selectedBranch,
        setSelectedBranch,
        isBranchSelectorOpen,
        openBranchSelector,
        closeBranchSelector,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};
