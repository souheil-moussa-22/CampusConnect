import type { HelpRequestStatus } from "@/types/help-request.types";

const labels: Record<HelpRequestStatus, string> = { OPEN: "Open", HELP_ACCEPTED: "Help accepted", COMPLETED: "Completed" };
export function StatusBadge({ status }: { status: HelpRequestStatus }) {
  return <span className={`status status-${status === "OPEN" ? "open" : status === "HELP_ACCEPTED" ? "help" : "completed"}`}>{labels[status]}</span>;
}
