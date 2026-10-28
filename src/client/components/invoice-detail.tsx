import { useState } from "preact/hooks";
import { StatusBadge } from "./status-badge";
import { useApp } from "../context";
import { EditInvoiceTemplate } from "./edit-invoice-template";
import { ArrowLeft, Trash2, Edit3, Printer } from "lucide-preact";
import type { InvoiceStatus } from "../types";

const ALL_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"];

function formatInvoiceDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const iso = dateStr.includes("T") ? dateStr : (dateStr.includes(" ") ? dateStr.replace(" ", "T") + "Z" : `${dateStr}T00:00:00`);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InvoiceDetail() {
  const { selectedInvoice: invoice, invoiceTemplate, navigate, updateInvoice, deleteInvoice } = useApp();
  const [showEditTemplate, setShowEditTemplate] = useState(false);

  if (!invoice) return null;

  const balanceDue = invoice.status === "paid" ? 0 : invoice.total;
  const invoiceDate = formatInvoiceDate(invoice.created_at);
  const dueDate = invoice.due_date ? formatInvoiceDate(invoice.due_date) : invoiceDate;
  const customerAddressLines = [
    invoice.customer_name,
    invoice.customer_address || invoice.job_address,
    [invoice.customer_city, invoice.customer_state, invoice.customer_zip].filter(Boolean).join(", "),
    invoice.customer_phone,
    invoice.customer_email,
  ].filter(Boolean);

  return (
    <div class="page">
      <div class="page-header no-print">
        <button class="btn btn-back" onClick={() => navigate("/invoices")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div class="page-header-right">
          <StatusBadge status={invoice.status} />
          <button class="btn" onClick={() => window.print()}>
            <Printer size={14} /> Print A4
          </button>
          <button class="btn" onClick={() => setShowEditTemplate(true)}>
            <Edit3 size={14} /> Edit Invoice Format
          </button>
          <button class="btn btn-danger" onClick={() => deleteInvoice(invoice.id)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-main">
          <div class="invoice-sheet">
            <div class="invoice-sheet-header">
              <div class="invoice-brand-col">
                {invoiceTemplate.logo_url ? (
                  <div class="invoice-logo-image-wrap" onClick={() => setShowEditTemplate(true)} title="Click to change logo">
                    <img src={invoiceTemplate.logo_url} alt="Company Logo" class="invoice-logo-image" />
                  </div>
                ) : (
                  <div class="invoice-logo-box clickable" onClick={() => setShowEditTemplate(true)} title="Click to add logo">
                    LOGO
                  </div>
                )}
                <div class="invoice-company-address" style={{ whiteSpace: "pre-line" }}>
                  {invoiceTemplate.company_details || "Company Name and Address"}
                </div>
              </div>
              <div class="invoice-title-col">
                <h1 class="invoice-doc-title">INVOICE</h1>
                <div class="invoice-doc-number">{invoice.identifier}</div>
                <div class="invoice-balance-top">
                  <span class="invoice-balance-label">Balance Due</span>
                  <strong class="invoice-balance-amount">ZAR {formatNumber(balanceDue)}</strong>
                </div>
              </div>
            </div>

            <div class="invoice-meta-row">
              <div class="invoice-customer-block">
                <div class="invoice-section-caption">Customer Address</div>
                {customerAddressLines.length > 0 ? (
                  customerAddressLines.map((line, idx) => (
                    <div key={idx} class={idx === 0 ? "text-bold" : ""}>{line}</div>
                  ))
                ) : (
                  <div>—</div>
                )}
              </div>

              <div class="invoice-dates-block">
                <div class="invoice-date-line">
                  <span class="invoice-date-label">Invoice Date :</span>
                  <span>{invoiceDate}</span>
                </div>
                <div class="invoice-date-line">
                  <span class="invoice-date-label">Terms :</span>
                  <span>{invoiceTemplate.terms || "Due on Receipt"}</span>
                </div>
                <div class="invoice-date-line">
                  <span class="invoice-date-label">Due Date :</span>
                  <span>{dueDate}</span>
                </div>
                {invoice.job_identifier && (
                  <div class="invoice-date-line">
                    <span class="invoice-date-label">Job :</span>
                    <span class="identifier">{invoice.job_identifier}</span>
                  </div>
                )}
              </div>
            </div>

            <div class="table-scroll">
              <table class="invoice-template-table">
                <thead>
                  <tr>
                    <th class="col-num">#</th>
                    <th class="col-desc">Description</th>
                    <th class="col-qty text-right">Qty</th>
                    <th class="col-rate text-right">Rate</th>
                    <th class="col-amount text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.lines || []).map((line, idx) => (
                    <tr key={line.id}>
                      <td class="col-num">{idx + 1}</td>
                      <td class="col-desc">{line.description}</td>
                      <td class="col-qty text-right">{line.quantity.toFixed(2)}</td>
                      <td class="col-rate text-right">{formatNumber(line.unit_price)}</td>
                      <td class="col-amount text-right">{formatNumber(line.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div class="invoice-bottom-anchor">
              <div class="invoice-summary-wrap">
                <div class="invoice-summary">
                  <div class="invoice-summary-row">
                    <span>Sub Total</span>
                    <span>{formatNumber(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div class="invoice-summary-row">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span>{formatNumber(invoice.tax_amount)}</span>
                    </div>
                  )}
                  <div class="invoice-summary-row invoice-summary-total">
                    <span>Total</span>
                    <span>ZAR {formatNumber(invoice.total)}</span>
                  </div>
                  <div class="invoice-summary-row invoice-summary-balance">
                    <span>Balance Due</span>
                    <span>ZAR {formatNumber(balanceDue)}</span>
                  </div>
                </div>
              </div>

              <div class="invoice-bank-details">
                <div class="invoice-section-caption">Bank Details</div>
                {invoiceTemplate.bank_details ? (
                  <p class="detail-notes" style={{ marginTop: 6 }}>{invoiceTemplate.bank_details}</p>
                ) : (
                  <p class="text-muted no-print" style={{ marginTop: 6, fontSize: 12, cursor: "pointer" }} onClick={() => setShowEditTemplate(true)}>
                    Click "Edit Invoice Format" to add banking details
                  </p>
                )}
                {invoice.notes && <p class="detail-notes" style={{ marginTop: 10 }}>{invoice.notes}</p>}
              </div>

              <div class="invoice-sheet-footer">
                <span>1</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-sidebar no-print">
          <div class="detail-sidebar-section">
            <h4>Status</h4>
            <div class="status-buttons">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  class={`status-btn ${invoice.status === s ? "active" : ""}`}
                  onClick={() => updateInvoice(invoice.id, { status: s, ...(s === "paid" ? { paid_date: new Date().toISOString().split("T")[0] } : {}) })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div class="detail-sidebar-section">
            <h4>Due Date</h4>
            <input
              type="date"
              value={invoice.due_date}
              onChange={(e) => updateInvoice(invoice.id, { due_date: (e.target as HTMLInputElement).value })}
              style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13 }}
            />
          </div>

          <div class="detail-sidebar-section">
            <h4>Invoice Format</h4>
            <button class="btn" style={{ width: "100%" }} onClick={() => setShowEditTemplate(true)}>
              <Edit3 size={14} /> Edit Logo & Bank Details
            </button>
          </div>
        </div>
      </div>

      {showEditTemplate && <EditInvoiceTemplate onClose={() => setShowEditTemplate(false)} />}
    </div>
  );
}
