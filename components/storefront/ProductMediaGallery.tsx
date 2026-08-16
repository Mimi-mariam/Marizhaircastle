"use client";

import React, { useState } from "react";
import styles from "./ProductMediaGallery.module.css";

interface MediaItem {
  id?: string;
  type: "image" | "video";
  url: string;
  alt?: string;
}

interface ProductMediaGalleryProps {
  productName: string;
  images: Array<{ id?: string; url: string; alt?: string }>;
  videoUrl?: string | null;
}

export const ProductMediaGallery: React.FC<ProductMediaGalleryProps> = ({
  productName,
  images,
  videoUrl,
}) => {
  // Build unified media items list
  const mediaList: MediaItem[] = [];

  // Add images
  images.forEach((img) => {
    mediaList.push({
      id: img.id,
      type: "image",
      url: img.url,
      alt: img.alt || productName,
    });
  });

  // Add video if available
  if (videoUrl) {
    mediaList.push({
      type: "video",
      url: videoUrl,
      alt: `${productName} Video Showcase`,
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);

  if (mediaList.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.imageFallback} aria-hidden="true">
          {productName.charAt(0)}
        </div>
      </div>
    );
  }

  const activeMedia = mediaList[activeIndex] || mediaList[0];

  return (
    <div className={styles.container}>
      {/* Main active display */}
      <div className={styles.activeMediaWrapper}>
        {activeMedia.type === "video" ? (
          activeMedia.url.includes("instagram.com") ? (
            <iframe
              key={activeMedia.url}
              src={`${activeMedia.url.replace(/\/$/, "")}/embed/`}
              className={styles.mainVideo}
              style={{ border: "none", minHeight: "480px" }}
              title={`${productName} Video Showcase`}
              allowFullScreen
            />
          ) : (
            <video
              key={activeMedia.url}
              src={activeMedia.url}
              controls
              autoPlay
              playsInline
              className={styles.mainVideo}
            >
              Your browser does not support video playback.
            </video>
          )
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={activeMedia.url}
            src={activeMedia.url}
            alt={activeMedia.alt || productName}
            className={styles.mainImage}
          />
        )}
      </div>

      {/* Thumbnails row if multiple items */}
      {mediaList.length > 1 && (
        <div className={styles.thumbnails}>
          {mediaList.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                className={`${styles.thumbnailButton} ${
                  isSelected ? styles.selectedThumbnail : ""
                }`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`View ${item.type === "video" ? "Video" : `Photo ${idx + 1}`}`}
              >
                {item.type === "video" ? (
                  <div className={styles.videoThumbnailBadge}>
                    <span>▶ Video</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || `Thumbnail ${idx + 1}`}
                    className={styles.thumbnailImage}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
