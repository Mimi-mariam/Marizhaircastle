"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "RECEIVED",
  "IN_REVIEW",
  "CONFIRMED",
  "COMPLETED",
  "DECLINED",
] as const;

interface CustomWigStatusSelectProps {
  id: string;
  status: string;
}

export function CustomWigStatusSelect({
  id,
  status,
}: CustomWigStatusSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string) {
    const previous = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/custom-wigs/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setValue(previous);
      } else {
        router.refresh();
      }
    } catch {
      setValue(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      aria-label="Update request status"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}