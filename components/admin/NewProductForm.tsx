"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./NewProductForm.module.css";

interface CategoryOption {
  id: string;
  name: string;
}

export const NewProductForm: React.FC<{ categories: CategoryOption[] }> = ({
  categories,
}) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [previousPrice, setPreviousPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [texture, setTexture] = useState("Bone Straight");
  const [length, setLength] = useState('18"');
  const [color, setColor] = useState("Natural Black (1B)");
  const [careInfo, setCareInfo] = useState("");
  const [stock, setStock] = useState("10");

  // Media state
  const [images, setImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      if (isVideo) {
        setVideoUrl(data.url);
      } else {
        setImages((prev) => [...prev, { url: data.url, alt: name || "Product image" }]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Media upload failed");
    } finally {
      setIsUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, { url: imageUrlInput.trim(), alt: name || "Product image" }]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: parseFloat(price),
          previousPrice: previousPrice ? parseFloat(previousPrice) : undefined,
          categoryId: categoryId || undefined,
          texture,
          length,
          color,
          careInfo,
          videoUrl: videoUrl.trim() || undefined,
          images: images.map((img, idx) => ({
            url: img.url,
            alt: img.alt,
            position: idx,
          })),
          initialStock: parseInt(stock, 10) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.grid}>
        {/* Core details */}
        <Card className={styles.section}>
          <h2 className={styles["section-title"]}>General Details</h2>
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Raw Vietnamese Bone Straight Lace Wig"
            required
          />

          <Input
            label="URL Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <div className={styles["input-group"]}>
            <label className={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={4}
              placeholder="Detailed description of the hair bundle / wig unit..."
              required
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Price (₦ NGN)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="185000"
              required
            />
            <Input
              label="Original / Strikethrough Price (Optional)"
              type="number"
              value={previousPrice}
              onChange={(e) => setPreviousPrice(e.target.value)}
              placeholder="210000"
            />
          </div>
        </Card>

        {/* Hair Attributes */}
        <Card className={styles.section}>
          <h2 className={styles["section-title"]}>Hair Attributes & Category</h2>
          
          <div className={styles["input-group"]}>
            <label className={styles.label}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={styles.select}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <Input
              label="Texture"
              value={texture}
              onChange={(e) => setTexture(e.target.value)}
              placeholder="Bone Straight, Deep Wave, Pixie Curls"
            />
            <Input
              label="Length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder='14", 22", 30"'
            />
          </div>

          <Input
            label="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Natural Black, 613 Blonde, Piano Highlight"
          />

          <div className={styles["input-group"]}>
            <label className={styles.label}>Maintenance & Care Instructions</label>
            <textarea
              value={careInfo}
              onChange={(e) => setCareInfo(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="Use sulfate-free shampoo, heat protectant serum..."
            />
          </div>

          <Input
            label="Initial Inventory Units"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </Card>
      </div>

      {/* Product Media Section */}
      <Card className={styles.section}>
        <h2 className={styles["section-title"]}>Product Media (Pictures & Video Showcase)</h2>
        <p className={styles["media-intro"]}>
          Add high-resolution product photos and an optional video showcase. Customers convert higher when seeing lace melt quality and hair bounce.
        </p>

        {uploadError && <div className={styles.alert}>{uploadError}</div>}

        <div className={styles["media-grid"]}>
          {/* Images upload box */}
          <div className={styles["media-column"]}>
            <h3 className={styles["subsection-title"]}>Product Photos ({images.length})</h3>

            <div className={styles["upload-dropzone"]}>
              <label className={styles["upload-label"]}>
                <span className={styles["upload-icon"]}>📷</span>
                <span className={styles["upload-text"]}>
                  {isUploadingMedia ? "Uploading image..." : "Upload Product Photo"}
                </span>
                <span className={styles["upload-subtext"]}>Supports JPEG, PNG, WEBP, GIF (up to 15MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={styles["file-input"]}
                  onChange={(e) => handleFileUpload(e, false)}
                  disabled={isUploadingMedia}
                />
              </label>
            </div>

            <div className={styles["url-add-row"]}>
              <Input
                label="Or add Photo by Image URL"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://... or /images/..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImageUrl}
                disabled={!imageUrlInput.trim()}
              >
                Add
              </Button>
            </div>

            {images.length > 0 && (
              <div className={styles["image-previews"]}>
                {images.map((img, idx) => (
                  <div key={idx} className={styles["image-preview-card"]}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || `Preview ${idx + 1}`} className={styles["preview-img"]} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className={styles["remove-btn"]}
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <span className={styles["preview-tag"]}>{idx === 0 ? "Cover Photo" : `Photo #${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video upload box */}
          <div className={styles["media-column"]}>
            <h3 className={styles["subsection-title"]}>Product Showcase Video (Optional)</h3>

            <div className={styles["upload-dropzone"]}>
              <label className={styles["upload-label"]}>
                <span className={styles["upload-icon"]}>🎥</span>
                <span className={styles["upload-text"]}>
                  {isUploadingMedia ? "Uploading video..." : "Upload Hair Showcase Video"}
                </span>
                <span className={styles["upload-subtext"]}>Supports MP4, WEBM, MOV (up to 100MB)</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className={styles["file-input"]}
                  onChange={(e) => handleFileUpload(e, true)}
                  disabled={isUploadingMedia}
                />
              </label>
            </div>

            <Input
              label="Or Video URL / Embed Path"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. /uploads/products/vid-sample.mp4 or https://..."
            />

            {videoUrl ? (
              <div className={styles["video-preview-wrapper"]}>
                <div className={styles["video-preview-header"]}>
                  <span>Video Preview</span>
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className={styles["remove-video-btn"]}
                  >
                    Remove Video
                  </button>
                </div>
                <video
                  src={videoUrl}
                  controls
                  className={styles["preview-video"]}
                  preload="metadata"
                >
                  Your browser does not support playing this video.
                </video>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <div className={styles.footer}>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save & Publish Hair Product
        </Button>
      </div>
    </form>
  );
};
