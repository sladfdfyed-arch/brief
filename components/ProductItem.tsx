"use client";

import { Product } from "@/lib/types";
import { getTweetId } from "@/lib/tweet";
import { getVideoEmbedInfo } from "@/lib/video";
import TweetEmbed from "@/components/TweetEmbed";
import VideoEmbed from "@/components/VideoEmbed";
import styles from "./ProductItem.module.css";

interface ProductItemProps {
  product: Product;
  scale: number;
  opacity: number;
  isActive: boolean;
  isSelected: boolean;
  onHoverStart: (product: Product) => void;
  onHoverEnd: () => void;
  onSelect: (product: Product) => void;
}

export default function ProductItem({
  product,
  scale,
  opacity,
  isActive,
  isSelected,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: ProductItemProps) {
  const tweetUrl = product.tweetUrl ?? product.url;
  const tweetId = getTweetId(tweetUrl);
  const videoInfo = getVideoEmbedInfo(product.url) ?? getVideoEmbedInfo(product.tweetUrl ?? undefined);

  const showEmbed = (isActive || isSelected) && (tweetId || videoInfo);

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.item}
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
      onMouseEnter={() => onHoverStart(product)}
      onMouseLeave={onHoverEnd}
      onFocus={() => onHoverStart(product)}
      onBlur={onHoverEnd}
      onClick={() => onSelect(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product);
        }
      }}
      aria-label={`${product.name}: ${product.shortDescription}. Click to play voiceover.`}
    >
      <div className={styles.itemHead}>
        <span className={styles.icon}>{product.icon}</span>
        <span className={styles.copy}>
          <strong className={styles.name}>{product.name}</strong>
          <span className={styles.description}>{product.shortDescription}</span>
        </span>
        {isActive ? <span className={styles.activeDot} /> : null}
        {product.url ? (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${product.name} in new tab`}
          >
            ↗
          </a>
        ) : null}
      </div>
      {showEmbed ? (
        <div className={styles.tweetWrap}>
          {tweetId ? (
            <TweetEmbed tweetUrl={tweetUrl} />
          ) : videoInfo ? (
            <VideoEmbed info={videoInfo} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
