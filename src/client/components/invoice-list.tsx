import { useState } from "preact/hooks";
import { StatusBadge } from "./status-badge";
import { useApp } from "../context";
import { Pagination } from "./pagination";
import { EditInvoiceTemplate } from "./edit-invoice-template";
import { Trash2, Edit3 } from "lucide-preact";

const STATUSES: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export function InvoiceList() {
  const {
    invoices, invoicesPag, setInvoicesPage, invoicesStatusFilter, setInvoicesStatusFilter,
    navigate, deleteInvoice, isAgent,
  } = useApp();
  const [showEditTemplate, setShowEditTemplate] = useState(false);

  return (
    <div class="page">
      <div class="page-header">
        <h1>Invoices</h1>
        <button class="btn" onClick={() => setShowEditTemplate(true)}>
          <Edit3 size={14} /> Edit Invoice Format
        </button>
      </div>

      <div class="toolbar">
        <div class="filter-group">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              class={`filter-btn ${invoicesStatusFilter === s.value ? "active" : ""}`}
              onClick={() => setInvoicesStatusFilter(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div class="table-scroll">
        {invoices.length === 0 ? (
          <div class="empty-state">
            <p>No invoices yet</p>
            <p class="text-muted">Create invoices from completed jobs</p>
          </div>
        ) : (
          <table class="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Job</th>
                <th>Status</th>
                <th>Due Date</th>
                <th class="text-right">Total</th>
                {isAgent && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                return (
                  <tr key={inv.id} class="table-row clickable" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <td><span class="identifier">{inv.identifier}</span></td>
                    <td>{inv.customer_name || "—"}</td>
                    <td class="text-muted">{inv.job_identifier || "—"}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td class="text-muted">{inv.due_date || "—"}</td>
                    <td class="text-bold text-right">ZAR {inv.total.toFixed(2)}</td>
                    {isAgent && (
                      <td>
                        <button class="btn-icon danger" onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr><td colSpan={5}>This page · {invoices.length} invoices</td><td class="text-right">ZAR {invoices.reduce((total, invoice) => total + invoice.total, 0).toFixed(2)}</td>{isAgent && <td />}</tr></tfoot>
          </table>
        )}
      </div>

      <Pagination pag={invoicesPag} setPage={setInvoicesPage} />
      {showEditTemplate && <EditInvoiceTemplate onClose={() => setShowEditTemplate(false)} />}
    </div>
  );
}
