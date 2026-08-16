"use client";

import { useState } from "react";
import styles from "./WigCustomizer.module.css";

const LENGTH_OPTIONS = [
  '14"',
  '16"',
  '18"',
  '20"',
  '22"',
  '24"',
  '26"',
];

const LACE_SIZE_OPTIONS = [
  "4x4",
  "5x5",
  "6x6",
  "7x7",
  "8x8",
  "13x4",
  "13x6",
];

const DENSITY_OPTIONS = [
  "2 bundles (200g)",
  "3 bundles (300g)",
  "4 bundles (400g)",
];

const CAP_SIZE_OPTIONS = ["Small", "Medium", "Large", "Custom Measurement"];

const WIG_CAP_OPTIONS = [
  "Cap",
  "Melting Cap",
  "HD / Transparent Cap",
];

const PARTING_OPTIONS = ["Middle Part", "Side Part", "Free Part"];

const CUT_LACE_OPTIONS = [
  "No, leave lace uncut",
  "Yes, cut the lace",
];

const MEASUREMENT_LABELS = [
  "Head circumference",
  "Forehead to nape",
  "Ear to ear across forehead",
  "Ear to ear over top",
  "Temple to temple round back",
  "Nape of neck",
];

interface WigCustomizerProps {
  defaultColor?: string | null;
  defaultTexture?: string | null;
}

export function WigCustomizer({
  defaultColor,
  defaultTexture,
}: WigCustomizerProps) {
  const [length, setLength] = useState("16\"");
  const [laceSize, setLaceSize] = useState("5x5");
  const [density, setDensity] = useState(DENSITY_OPTIONS[0]);
  const [capSize, setCapSize] = useState(CAP_SIZE_OPTIONS[1]);
  const [wigCap, setWigCap] = useState(WIG_CAP_OPTIONS[0]);
  const [parting, setParting] = useState(PARTING_OPTIONS[0]);
  const [cutLace, setCutLace] = useState(CUT_LACE_OPTIONS[0]);
  const [color, setColor] = useState(defaultColor ?? "Caramel with a dark brown base");
  const [texture, setTexture] = useState(defaultTexture ?? "Wavy");
  const [cut, setCut] = useState("Face Frame Layers");
  const [measurements, setMeasurements] = useState<string[]>(
    MEASUREMENT_LABELS.map(() => "")
  );

  const model = `${laceSize} ${wigCap} | ${length} layered | ${density} | ${parting}`;

  function renderSelect(
    label: string,
    value: string,
    options: string[],
    onChange: (value: string) => void
  ) {
    return (
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{label}</span>
        <select
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <section className={styles.wrapper} aria-label="Custom wig configuration">
      <h2 className={styles.title}>Customize Your Wig</h2>
      <p className={styles.intro}>
        Choose every detail below for a seamless, made-for-you unit. Your
        selections are previewed in the summary — the gold standard of
        Marizhaircastle craftsmanship.
      </p>

      <div className={styles.grid}>
        {renderSelect("Length", length, LENGTH_OPTIONS, setLength)}
        {renderSelect("Lace Size", laceSize, LACE_SIZE_OPTIONS, setLaceSize)}
        {renderSelect("Wig Density", density, DENSITY_OPTIONS, setDensity)}

        {renderSelect(
          "Cap Size",
          capSize,
          CAP_SIZE_OPTIONS,
          setCapSize
        )}

        {renderSelect("Wig Cap", wigCap, WIG_CAP_OPTIONS, setWigCap)}
        {renderSelect("Parting", parting, PARTING_OPTIONS, setParting)}
        {renderSelect("Cut the lace", cutLace, CUT_LACE_OPTIONS, setCutLace)}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Colour</span>
          <input
            className={styles.input}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Texture</span>
          <input
            className={styles.input}
            value={texture}
            onChange={(e) => setTexture(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Cut</span>
          <input
            className={styles.input}
            value={cut}
            onChange={(e) => setCut(e.target.value)}
          />
        </label>
      </div>

      {capSize === "Custom Measurement" ? (
        <div className={styles.measurements}>
          <span className={styles.fieldLabel}>
            Custom Measurement (refer to size guide)
          </span>
          <div className={styles.grid}>
            {MEASUREMENT_LABELS.map((label, index) => (
              <label key={label} className={styles.field}>
                <span className={styles.fieldLabel}>{label}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={measurements[index]}
                  placeholder="(inches)"
                  onChange={(e) => {
                    const next = [...measurements];
                    next[index] = e.target.value;
                    setMeasurements(next);
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Your selection</span>
        <dl className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <dt>Model</dt>
            <dd>{model}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Colour</dt>
            <dd>{color}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Texture</dt>
            <dd>{texture}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Cut</dt>
            <dd>{cut}</dd>
          </div>
        </dl>
        <p className={styles.note}>
          Made from our multi donor raw hair, handpicked for a more affordable
          option.
        </p>
      </div>
    </section>
  );
}