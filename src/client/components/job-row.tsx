import { useApp } from "../context";
import { StatusBadge } from "./status-badge";
import { Trash2 } from "lucide-preact";
import type { Job } from "../types";

function formatTimestamp(ts: string): string {
  const iso = ts.includes("T") ? ts : ts.replace(" ", "T") + "Z";
  return new Date(iso).toLocaleString();
}

export function JobRow({ job }: { job: Job }) {
  const { navigate, deleteJob, isAgent } = useApp();

  return (
    <tr class="table-row clickable" onClick={() => navigate(`/jobs/${job.id}`)}>
      <td><span class="identifier">{job.identifier}</span></td>
      <td>{job.scheduled_date}</td>
      <td class="text-muted">{job.scheduled_time}</td>
      <td>{job.customer_name || "—"}</td>
      <td>
        {job.service_type_name ? (
          <span class="service-pill" style={{ borderColor: job.service_type_color || "var(--text-muted)" }}>
            <span class="service-dot" style={{ background: job.service_type_color || "var(--text-muted)" }} />
            {job.service_type_name}
          </span>
        ) : (
          <span class="text-muted">—</span>
        )}
      </td>
      <td>
        {job.technician_name ? (
          <span class="tech-pill" style={{ borderColor: job.technician_color || "var(--text-muted)" }}>
            <span class="tech-dot" style={{ background: job.technician_color || "var(--text-muted)" }} />
            {job.technician_name}
          </span>
        ) : (
          <span class="text-muted">Unassigned</span>
        )}
      </td>
      <td>
        <div>
          <StatusBadge status={job.status} />
          {job.status_changed_at && (
            <div class="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
              {formatTimestamp(job.status_changed_at)}
            </div>
          )}
        </div>
      </td>
      <td class="text-right">ZAR {job.price.toFixed(2)}</td>
      {isAgent && (
        <td>
          <button
            class="btn-icon danger"
            onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
          >
            <Trash2 size={14} />
          </button>
        </td>
      )}
    </tr>
  );
}
