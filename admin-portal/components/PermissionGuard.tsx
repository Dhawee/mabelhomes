"use client";

import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { hasPermission } from "@/lib/auth";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Check permission on mount
    setHasAccess(hasPermission(permission));
  }, [permission]);

  if (hasAccess === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-950/20 border border-red-800/30 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-950/10">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 max-w-md mb-6">
          Your account does not possess the required explicit permission (<span className="font-mono text-xs text-amber-500">{permission}</span>) 
          to access this management view. Please contact your system administrator to adjust your role assignments.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
