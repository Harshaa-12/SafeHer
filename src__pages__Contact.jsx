import { useEffect, useState } from "react";
import {
  UserPlus,
  UserRound,
  Phone,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  ShieldCheck,
  Users,
  Heart,
  AlertCircle,
  Star,
  MessageSquare,
  Smartphone,
  PhoneCall,
  Info,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "../config";
import { useLanguage } from "../i18n/LanguageContext";

const emptyForm = {
  name: "",
  phone: "",
  relationship: "",
  is_primary: false,
  sms_consent: true,
  whatsapp_consent: true,
};

function normalizePhone(phone = "") {
  return phone.replace(/[\s()-]/g, "");
}

export default function Contact() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deleteContact, setDeleteContact] = useState(null);
  const [feedback, setFeedback] = useState("");

  const CONTACTS_API = `${API_BASE_URL}/api/contacts`;

  async function loadContacts() {
    try {
      const response = await fetch(CONTACTS_API, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load contacts.");
      }

      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Loading contacts failed:", err);
      setFeedback("Unable to load contacts. Verify backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const query = search.trim().toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.phone?.includes(query) ||
      contact.relationship?.toLowerCase().includes(query)
    );
  });

  const primaryContact = contacts.find((c) => Boolean(c.is_primary));

  function openAddForm() {
    setForm({
      ...emptyForm,
      is_primary: contacts.length === 0, // auto-select primary if first contact
    });
    setEditingId(null);
    setError("");
    setFeedback("");
    setFormOpen(true);
  }

  function openEditForm(contact) {
    setForm({
      name: contact.name || "",
      phone: contact.phone || "",
      relationship: contact.relationship || "",
      is_primary: Boolean(contact.is_primary),
      sms_consent: Boolean(contact.sms_consent),
      whatsapp_consent: Boolean(contact.whatsapp_consent),
    });
    setEditingId(contact.id);
    setError("");
    setFeedback("");
    setFormOpen(true);
  }

  function closeForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setFormOpen(false);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setError("");

    const name = form.name.trim();
    const phone = form.phone.trim();
    const relationship = form.relationship.trim();
    const normalized = normalizePhone(phone);

    if (!name || !phone || !relationship) {
      setError("Please fill in name, phone number, and relationship.");
      return;
    }

    if (!/^\+?[0-9]{10,14}$/.test(normalized)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const duplicate = contacts.some(
      (c) =>
        normalizePhone(c.phone) === normalized &&
        String(c.id) !== String(editingId)
    );

    if (duplicate) {
      setError("A contact with this phone number already exists.");
      return;
    }

    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `${CONTACTS_API}/${editingId}` : CONTACTS_API;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          phone,
          relationship,
          is_primary: form.is_primary ? 1 : 0,
          sms_consent: form.sms_consent ? 1 : 0,
          whatsapp_consent: form.whatsapp_consent ? 1 : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save contact.");
      }

      await loadContacts();
      setFeedback(isEditing ? "Contact updated successfully." : "Trusted contact added.");
      closeForm();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      console.error("Saving contact failed:", err);
      setError(err.message || "Unable to save contact. Check backend.");
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteContact) return;

    try {
      const response = await fetch(`${CONTACTS_API}/${deleteContact.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete contact.");
      }

      setContacts((prev) => prev.filter((c) => c.id !== deleteContact.id));
      setFeedback(`Removed ${deleteContact.name} from your safety circle.`);
      setDeleteContact(null);
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      console.error("Delete failed:", err);
      setFeedback(err.message || "Could not delete contact.");
      setDeleteContact(null);
    }
  }

  return (
    <section className="contacts-page">
      {/* Header */}
      <div className="contacts-heading">
        <div>
          <p className="contacts-eyebrow">SAFEHER • YOUR SAFETY CIRCLE</p>
          <h2>Trusted Safety Circle</h2>
          <p>
            These are the verified people SafeHer may reach out to during configured emergency events.
          </p>
        </div>
        <div className="contacts-heading-icon">
          <ShieldCheck size={32} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="contacts-summary-grid">
        <div className="contacts-summary">
          <div className="contacts-summary-icon">
            <Users size={20} />
          </div>
          <div className="contacts-summary-body">
            <span className="contacts-summary-label">Total Contacts</span>
            <h3 className="contacts-summary-val">{contacts.length}</h3>
          </div>
        </div>

        <div className="contacts-summary">
          <div className="contacts-summary-icon primary-icon">
            <Star size={20} />
          </div>
          <div className="contacts-summary-body">
            <span className="contacts-summary-label">Primary Contact</span>
            <h4 className="contacts-summary-val-text" title={primaryContact ? primaryContact.name : "None designated"}>
              {primaryContact ? primaryContact.name : "None designated"}
            </h4>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="contacts-toolbar">
        <div className="contacts-search">
          <Search size={18} />
          <input
            type="search"
            placeholder={t("contacts.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search trusted contacts"
          />
          {search && (
            <button
              type="button"
              className="contacts-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          className="contacts-add-button"
          onClick={openAddForm}
        >
          <UserPlus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="contacts-feedback" role="status">
          <Check size={17} />
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ADD / EDIT MODAL FORM */}
      {formOpen && (
        <div className="contacts-form-card">
          <div className="contacts-form-heading">
            <div className="contacts-form-heading-text">
              <h3>{editingId !== null ? t("contacts.edit_contact") : t("contacts.add_to_circle")}</h3>
              <p>{t("contacts.configure_desc")}</p>
            </div>
            <button
              type="button"
              className="contacts-icon-button"
              onClick={closeForm}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="contacts-form">
            <div className="contacts-form-field">
              <label htmlFor="contact-name">{t("contacts.name")} *</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder={t("contacts.name_placeholder")}
                value={form.name}
                onChange={handleChange}
                maxLength={80}
                required
              />
            </div>

            <div className="contacts-form-field">
              <label htmlFor="contact-phone">{t("contacts.phone")} *</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={handleChange}
                maxLength={20}
                required
              />
            </div>

            <div className="contacts-form-field">
              <label htmlFor="contact-relationship">Relationship / Category *</label>
              <select
                id="contact-relationship"
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="Family">Family</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Primary & Notification Consent Controls */}
            <div className="contacts-preferences-box">
              <strong className="preferences-title">
                Emergency Dispatch Settings
              </strong>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_primary"
                  checked={form.is_primary}
                  onChange={handleChange}
                />
                <span className={form.is_primary ? "primary-tag-active" : ""}>
                  Designate as Primary Emergency Contact
                </span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="sms_consent"
                  checked={form.sms_consent}
                  onChange={handleChange}
                />
                <span>Enable SMS Alerts (Fast dispatch during SOS)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="whatsapp_consent"
                  checked={form.whatsapp_consent}
                  onChange={handleChange}
                />
                <span>Enable WhatsApp Alerts (Rich location link)</span>
              </label>
            </div>

            {error && (
              <div className="contacts-error" role="alert">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <div className="contacts-form-actions">
              <button
                type="button"
                className="contacts-cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>
              <button type="submit" className="contacts-save-button">
                <Check size={17} />
                <span>{editingId !== null ? "Save Changes" : "Add to Circle"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteContact && (
        <div className="hub-modal-backdrop" onClick={() => setDeleteContact(null)}>
          <div className="hub-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px" }}>
            <div className="hub-modal-header">
              <h3>Remove Contact?</h3>
              <button type="button" className="hub-modal-close" onClick={() => setDeleteContact(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "#475569", margin: "12px 0 16px" }}>
              Are you sure you want to remove <strong>{deleteContact.name}</strong> ({deleteContact.phone}) from your safety circle?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteContact(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: "#e11d48", color: "#fff" }}
                onClick={handleDeleteConfirmed}
              >
                Remove Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="contacts-list-heading">
        <div>
          <h3>Safety Circle Members</h3>
          <p>
            {loading
              ? "Loading circle..."
              : search
              ? `${filteredContacts.length} matching contact(s)`
              : `${contacts.length} registered contacts`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="contacts-empty">
          <p>Loading your trusted contacts from server...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="contacts-empty" style={{ padding: "30px 20px" }}>
          <div className="contacts-empty-icon">
            <Users size={32} />
          </div>
          <h4>No Contacts Found</h4>
          <p style={{ maxWidth: "300px", margin: "6px auto 14px", fontSize: "13px", color: "#64748b" }}>
            {search
              ? "No contacts matched your search query."
              : "Add trusted family members or friends who can be notified immediately in an emergency."}
          </p>
          {!search && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddForm}
              style={{ background: "#c73562", color: "#fff", padding: "10px 18px", borderRadius: "12px", border: "none", fontWeight: 600 }}
            >
              <UserPlus size={16} /> Add First Contact
            </button>
          )}
        </div>
      ) : (
        <div className="contacts-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-card ${contact.is_primary ? "primary-card" : ""}`}
              style={{
                background: "#ffffff",
                border: contact.is_primary ? "1.5px solid #f43f5e" : "1px solid #f1e4eb",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      minWidth: "40px",
                      borderRadius: "50%",
                      background: contact.is_primary ? "#fee2e2" : "#fbe3ed",
                      color: contact.is_primary ? "#e11d48" : "#a72d61",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "14.5px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }} title={contact.name}>
                        {contact.name}
                      </strong>
                      {Boolean(contact.is_primary) && (
                        <span
                          style={{
                            background: "#fee2e2",
                            color: "#be123c",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "10px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            flexShrink: 0,
                          }}
                        >
                          <Star size={10} /> Primary
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>{contact.relationship}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  <a
                    href={`tel:${contact.phone}`}
                    className="icon-action-btn"
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      padding: "8px",
                      borderRadius: "10px",
                      display: "flex",
                      textDecoration: "none",
                    }}
                    title={`Call ${contact.name}`}
                  >
                    <PhoneCall size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditForm(contact)}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      padding: "8px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    title="Edit contact"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteContact(contact)}
                    style={{
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "none",
                      padding: "8px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    title="Delete contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px dashed #f1e4eb", fontSize: "12px" }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>{contact.phone}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: contact.sms_consent ? "#059669" : "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <Smartphone size={12} /> SMS: {contact.sms_consent ? "ON" : "OFF"}
                  </span>
                  <span style={{ fontSize: "11px", color: contact.whatsapp_consent ? "#059669" : "#94a3b8", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <MessageSquare size={12} /> WA: {contact.whatsapp_consent ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div style={{ marginTop: "20px", padding: "12px", background: "#fff", border: "1px solid #f1e4eb", borderRadius: "12px", display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "12px", color: "#64748b" }}>
        <Info size={16} className="text-rose" style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>
          Contacts with <strong>SMS</strong> and <strong>WhatsApp</strong> consent enabled will be notified with your emergency GPS coordinates when you trigger a verified Real SOS.
        </span>
      </div>
    </section>
  );
}
