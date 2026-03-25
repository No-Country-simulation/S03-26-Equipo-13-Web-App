export declare enum FlowTrigger {
    contact_created = "contact_created",
    status_changed = "status_changed",
    tag_added = "tag_added",
    manual = "manual"
}
export declare enum FlowStepType {
    send_whatsapp = "send_whatsapp",
    send_email = "send_email",
    wait = "wait",
    update_status = "update_status",
    assign_tag = "assign_tag"
}
export declare class FlowStepDto {
    type: FlowStepType;
    config?: Record<string, any>;
}
export declare class CreateFlowDto {
    name: string;
    trigger: FlowTrigger;
    steps: FlowStepDto[];
}
export declare class UpdateFlowDto {
    active?: boolean;
    name?: string;
    steps?: FlowStepDto[];
}
