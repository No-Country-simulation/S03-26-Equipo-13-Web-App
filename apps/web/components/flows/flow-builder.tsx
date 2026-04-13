"use client";

import FlowSidebar from "./flow-sidebar";
import FlowCanvas from "./flow-canvas";

export default function FlowBuilder() {
  return (
    <div className="flex gap-4 h-full">
      <FlowSidebar />
      <FlowCanvas />
    </div>
  );
}