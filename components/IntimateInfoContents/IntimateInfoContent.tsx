import React, { useState } from "react";
import { User } from "@/models";
import IntimateInfoContentList from "./IntimateInfoContentList";
import IntimateInfoContentEditor from "./IntimateInfoContentEditor";

type Props = {
  user: User;
};

export type ViewMode = "list" | "create" | "edit";

function IntimateInfoContent({ user }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setSelectedId(null);
    setViewMode("create");
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedId(null);
  };

  return (
    <div className="h-full w-full">
      {viewMode === "list" && (
        <IntimateInfoContentList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
        />
      )}
      {(viewMode === "create" || viewMode === "edit") && (
        <IntimateInfoContentEditor
          contentId={selectedId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}

export default IntimateInfoContent;
