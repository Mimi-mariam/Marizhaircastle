import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { CustomWigStatusSelect } from "@/components/admin/CustomWigStatusSelect";
import styles from "./custom-wigs.module.css";

function statusVariant(
  status: string
): "default" | "success" | "warning" | "error" | "info" | "outline" {
  switch (status) {
    case "RECEIVED":
      return "warning";
    case "IN_REVIEW":
      return "info";
    case "CONFIRMED":
      return "success";
    case "DECLINED":
      return "error";
    default:
      return "default";
  }
}

export default async function AdminCustomWigsPage() {
  const requests = await prisma.customWigRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Custom Wig Requests</h1>
          <p className={styles.subtitle}>
            Review design submissions from the &ldquo;Design Your Custom
            Wig&rdquo; form, then confirm, invoice, or decline each request.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className={styles.empty}>
          <p>No custom wig requests yet. They will appear here as customers submit the form.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((req) => (
            <div key={req.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.customerName}>{req.name}</span>
                  <span className={styles.customerContact}>
                    {req.email} · {req.phone}
                  </span>
                </div>
                <div className={styles.statusGroup}>
                  <Badge variant={statusVariant(req.status)}>
                    {req.status.replace(/_/g, " ")}
                  </Badge>
                  <CustomWigStatusSelect id={req.id} status={req.status} />
                </div>
              </div>

              <div className={styles.specs}>
                <span className={styles.spec}>
                  <strong>Wig Type</strong> {req.wigType}
                </span>
                <span className={styles.spec}>
                  <strong>Lace</strong> {req.laceSize}
                </span>
                <span className={styles.spec}>
                  <strong>Bundles</strong> {req.bundles}
                </span>
                <span className={styles.spec}>
                  <strong>Cap</strong> {req.capSize}
                </span>
                {req.length && (
                  <span className={styles.spec}>
                    <strong>Length</strong> {req.length}
                  </span>
                )}
              </div>

              <div className={styles.inspo}>
                {req.styleInspoUrl && (
                  <Link
                    href={req.styleInspoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.inspoLink}
                  >
                    Style Inspo ↗
                  </Link>
                )}
                {req.colorInspoUrl && (
                  <Link
                    href={req.colorInspoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.inspoLink}
                  >
                    Color Inspo ↗
                  </Link>
                )}
              </div>

              {req.notes && <p className={styles.notes}>{req.notes}</p>}

              <span className={styles.date}>
                Received{" "}
                {new Intl.DateTimeFormat("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(req.createdAt))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}