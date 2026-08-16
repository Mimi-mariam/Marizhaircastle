"use client";

import { useState } from "react";
import {
  customWigRequestSchema,
  WIG_TYPES,
  LACE_SIZE_OPTIONS,
  BUNDLE_OPTIONS,
  CAP_SIZE_OPTIONS,
  LENGTH_OPTIONS,
} from "@/lib/validation/custom-wig";
import styles from "./CustomWigForm.module.css";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 15 * 1024 * 1024;

interface InspoUpload {
  url: string;
  preview: string;
}

type FieldErrors = Record<string, string>;

export function CustomWigForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    wigType: "",
    laceSize: "",
    bundles: "",
    capSize: "",
    length: "",
    notes: "",
  });
  const [styleInspo, setStyleInspo] = useState<InspoUpload | null>(null);
  const [colorInspo, setColorInspo] = useState<InspoUpload | null>(null);
  const [uploading, setUploading] = useState<"style" | "color" | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads/custom-wig", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Upload failed. Please try again.");
    }
    const data = await res.json();
    return data.url as string;
  }

  async function handleInspoFile(
    kind: "style" | "color",
    file: File | undefined
  ) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [kind === "style" ? "styleInspoUrl" : "colorInspoUrl"]:
          "Please upload a JPG, JPEG, PNG, GIF, or WEBP image.",
      }));
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [kind === "style" ? "styleInspoUrl" : "colorInspoUrl"]:
          "Image exceeds the 15MB limit.",
      }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[kind === "style" ? "styleInspoUrl" : "colorInspoUrl"];
      return next;
    });
    setUploading(kind);
    try {
      const url = await uploadImage(file);
      const preview = URL.createObjectURL(file);
      if (kind === "style") {
        setStyleInspo({ url, preview });
      } else {
        setColorInspo({ url, preview });
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [kind === "style" ? "styleInspoUrl" : "colorInspoUrl"]:
          err instanceof Error ? err.message : "Upload failed. Please try again.",
      }));
    } finally {
      setUploading(null);
    }
  }

  function clearInspo(kind: "style" | "color") {
    if (kind === "style") {
      setStyleInspo(null);
    } else {
      setColorInspo(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setErrors({});

    const parsed = customWigRequestSchema.safeParse({
      ...form,
      styleInspoUrl: styleInspo?.url ?? "",
      colorInspoUrl: colorInspo?.url ?? "",
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: FieldErrors = {};
      for (const [key, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) {
          next[key] = messages[0];
        }
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/custom-wig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon} aria-hidden="true">
          ✓
        </span>
        <h2 className={styles.successTitle}>Request received!</h2>
        <p className={styles.successText}>
          Thank you for choosing Marizhaircastle. We&apos;ve received your
          custom wig request. We&apos;ll review your details, confirm your
          order, and send your invoice so we can begin creating your unit.
        </p>
        <p className={styles.successNote}>
          We can&apos;t wait to create something beautiful for you.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Name <span className={styles.required}>*</span>
          </span>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="First Name"
            aria-invalid={errors.name ? true : undefined}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Email <span className={styles.required}>*</span>
          </span>
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="Email"
            aria-invalid={errors.email ? true : undefined}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Phone <span className={styles.required}>*</span>
          </span>
          <input
            className={styles.input}
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="Phone"
            aria-invalid={errors.phone ? true : undefined}
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </label>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldLabel}>
          Wig Type? <span className={styles.required}>*</span>
        </legend>
        <div className={styles.pillGroup}>
          {WIG_TYPES.map((type) => (
            <label
              key={type}
              className={`${styles.pill} ${
                form.wigType === type ? styles.pillActive : ""
              }`}
            >
              <input
                type="radio"
                name="wigType"
                value={type}
                checked={form.wigType === type}
                onChange={(e) => setField("wigType", e.target.value)}
                className={styles.srOnly}
              />
              {type}
            </label>
          ))}
        </div>
        {errors.wigType && <span className={styles.error}>{errors.wigType}</span>}
      </fieldset>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Desired lace size? <span className={styles.required}>*</span>
          </span>
          <select
            className={styles.select}
            value={form.laceSize}
            onChange={(e) => setField("laceSize", e.target.value)}
            aria-invalid={errors.laceSize ? true : undefined}
          >
            <option value="">Please select</option>
            {LACE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.laceSize && (
            <span className={styles.error}>{errors.laceSize}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            How many bundles do you want? <span className={styles.required}>*</span>
          </span>
          <select
            className={styles.select}
            value={form.bundles}
            onChange={(e) => setField("bundles", e.target.value)}
            aria-invalid={errors.bundles ? true : undefined}
          >
            <option value="">Please select</option>
            {BUNDLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.bundles && (
            <span className={styles.error}>{errors.bundles}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            Cap Size? <span className={styles.required}>*</span>
          </span>
          <select
            className={styles.select}
            value={form.capSize}
            onChange={(e) => setField("capSize", e.target.value)}
            aria-invalid={errors.capSize ? true : undefined}
          >
            <option value="">Please select</option>
            {CAP_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className={styles.hint}>Reference size guide above</span>
          {errors.capSize && <span className={styles.error}>{errors.capSize}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>What length do you desire?</span>
          <select
            className={styles.select}
            value={form.length}
            onChange={(e) => setField("length", e.target.value)}
          >
            <option value="">Please select</option>
            {LENGTH_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <InspoUploader
        kind="style"
        label="Style Inspo"
        required
        hint="Please upload a photo showing your desired style (layers, curls, straight, etc.)."
        upload={styleInspo}
        uploading={uploading === "style"}
        error={errors.styleInspoUrl}
        onChange={(file) => handleInspoFile("style", file)}
        onClear={() => clearInspo("style")}
      />

      <InspoUploader
        kind="color"
        label="Color Inspo"
        required
        hint="Please upload a photo of what you want for the color. Please ensure that the color is similar to what you want because we will use this photo for guidance."
        upload={colorInspo}
        uploading={uploading === "color"}
        error={errors.colorInspoUrl}
        onChange={(file) => handleInspoFile("color", file)}
        onClear={() => clearInspo("color")}
      />

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Any additional details/questions?</span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Share anything else about your dream wig..."
        />
      </label>

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submitting || uploading !== null}
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}

interface InspoUploaderProps {
  kind: "style" | "color";
  label: string;
  required: boolean;
  hint: string;
  upload: InspoUpload | null;
  uploading: boolean;
  error?: string;
  onChange: (file: File | undefined) => void;
  onClear: () => void;
}

function InspoUploader({
  label,
  required,
  hint,
  upload,
  uploading,
  error,
  onChange,
  onClear,
}: InspoUploaderProps) {
  const inputId = `inspo-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={styles.uploadField}>
      <span className={styles.fieldLabel}>
        {label} {required && <span className={styles.required}>*</span>}
      </span>

      {upload ? (
        <div className={styles.uploadPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={upload.preview}
            alt={`${label} preview`}
            className={styles.previewImage}
          />
          <button
            type="button"
            className={styles.removeButton}
            onClick={onClear}
          >
            Remove
          </button>
        </div>
      ) : (
        <label className={styles.dropzone}>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={styles.srOnly}
            disabled={uploading}
            onChange={(e) => onChange(e.target.files?.[0])}
          />
          <span className={styles.dropzoneTitle}>
            {uploading ? "Uploading..." : "Choose file or drag here"}
          </span>
          <span className={styles.dropzoneHint}>
            Supported format: JPG, JPEG, PNG, GIF, WEBP.
          </span>
          <span className={styles.browseButton}>Browse file</span>
        </label>
      )}

      <p className={styles.hint}>{hint}</p>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}