import * as React from "react";
import { Badge } from "@/components/ui/badge";

const branch = (import.meta.env.VITE_BRANCH_NAME as string | undefined) || "";

export function BranchBadge() {
  const normalized = branch?.toLowerCase?.() || "";
  if (!normalized || normalized === "dev") return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 pointer-events-none">
      <Badge variant="secondary" className="pointer-events-auto shadow">
        Branch: {branch}
      </Badge>
    </div>
  );
}

export default BranchBadge;
