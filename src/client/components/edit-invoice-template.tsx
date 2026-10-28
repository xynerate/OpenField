import { useState } from "preact/hooks";
import { useApp } from "../context";
import { X, Upload, Trash2 } from "lucide-preact";

export function EditInvoiceTemplate({ onClose }: { onClose: () => void }) {
  const { invoiceTemplate, updateInvoiceTemplate, setError } = useApp();

  const [logoUrl, setLogoUrl] = useState(invoiceTemplate.logo_url);
  const [companyDetails, setCompanyDetails] = useState(invoiceTemplate.company_details);
  const [bankDetails, setBankDetails] = useState(invoiceTemplate.bank_details);
  const [terms, setTerms] = useState(invoiceTemplate.terms);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoUrl(reader.result);
      }
    };
    reader.onerror = () => setError("Failed to read logo file");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateInvoiceTemplate({
        logo_url: logoUrl,
        company_details: companyDetails,
        bank_details: bankDetails,
        terms: terms.trim() || "Due on Receipt",
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Edit Invoice Format</h2>
          <button class="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Company Logo</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {logoUrl ? (
                  <div class="invoice-logo-preview">
                    <img src={logoUrl} alt="Company logo preview" />
                  </div>
                ) : (
                  <div class="invoice-logo-box" style={{ width: 140, height: 64, fontSize: 20 }}>LOGO</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 }}>
                  <label class="btn" style={{ width: "fit-content", cursor: "pointer" }}>
                    <Upload size={14} /> Upload Logo Image
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onInput={(e) => setLogoUrl((e.target as HTMLInputElement).value)}
                    placeholder="Or paste image URL / data URI..."
                  />
                  {logoUrl && (
                    <button type="button" class="btn btn-danger btn-sm" style={{ width: "fit-content" }} onClick={() => setLogoUrl("")}>
                      <Trash2 size={12} /> Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Company Name & Address</label>
              <textarea
                rows={3}
                value={companyDetails}
                onInput={(e) => setCompanyDetails((e.target as HTMLTextAreaElement).value)}
                placeholder="Company Name&#10;123 Street Address&#10;Cape Town, Western Cape"
              />
            </div>

            <div class="form-group full-width">
              <label>Payment Terms</label>
              <input
                type="text"
                value={terms}
                onInput={(e) => setTerms((e.target as HTMLInputElement).value)}
                placeholder="Due on Receipt"
              />
            </div>

            <div class="form-group full-width">
              <label>Banking Details</label>
              <textarea
                rows={4}
                value={bankDetails}
                onInput={(e) => setBankDetails((e.target as HTMLTextAreaElement).value)}
                placeholder="Bank: First National Bank&#10;Account Name: ...&#10;Account Number: ...&#10;Branch Code: ..."
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" class="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Invoice Format"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
