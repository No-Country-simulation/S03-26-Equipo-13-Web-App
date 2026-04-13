


export type FlowTrigger =
  | "contact_created"
  | "status_changed"
  | "tag_added"
  | "manual";

export type FlowStepType =
  | "send_whatsapp"
  | "send_email"
  | "wait"
  | "update_status"
  | "assign_tag";

export interface FlowStep {
    id: string;
  type: FlowStepType;
  config?: Record<string, any>;
}

export interface FlowExecution {
  id: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  contactId: string;
}

export interface Flow {
  id: string;
  name: string;
  trigger: FlowTrigger;
  steps: FlowStep[];
  active: boolean;
  executions: FlowExecution[];
}


export const stepLabels: Record<FlowStepType, string> = {
  send_whatsapp: "WhatsApp",
  send_email: "Email",
  wait: "Espera",
  update_status: "Estado",
  assign_tag: "Tag",
};

export const stepStyles: Record<FlowStepType, string> = {
  send_whatsapp: "bg-green-50 border-green-100 text-green-700",
  send_email: "bg-blue-50 border-blue-100 text-blue-700",
  wait: "bg-slate-50 border-slate-100 text-slate-500",
  update_status: "bg-purple-50 border-purple-100 text-purple-700",
  assign_tag: "bg-indigo-50 border-indigo-100 text-indigo-700",
};