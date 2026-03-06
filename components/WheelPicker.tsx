"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/lib/types";
import HamburgerMenu from "@/components/HamburgerMenu";
import ProductItem from "@/components/ProductItem";
import VoiceoverPlayer from "@/components/VoiceoverPlayer";
import styles from "./WheelPicker.module.css";

// Lock document scroll so only the wheel scrolls
function useLockBodyScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100vh";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);
}

interface WheelPickerProps {
  products: Product[];
}

const WHEEL_STEP_THRESHOLD = 70;
const ITEM_GAP = 108;
const MAX_VISIBLE_OFFSET = 4;

function getVisuals(distance: number) {
  if (distance === 0) {
    return { scale: 1.28, opacity: 1 };
  }
  if (distance === 1) {
    return { scale: 1.1, opacity: 0.84 };
  }
  if (distance === 2) {
    return { scale: 0.96, opacity: 0.65 };
  }
  return { scale: 0.86, opacity: 0.45 };
}

export default function WheelPicker({ products }: WheelPickerProps) {
  useLockBodyScroll();
  const [centerIndex, setCenterIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wheelDeltaRef = useRef(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCenterIndex(0);
  }, [products]);

  const moveWheel = useCallback((direction: 1 | -1) => {
    setCenterIndex((prev) => {
      if (products.length === 0) {
        return prev;
      }
      const next = (prev + direction + products.length) % products.length;
      return next;
    });
  }, [products]);

  const handleSelect = useCallback(
    (product: Product) => {
      setSelectedId(product.id);
      if (product.audioFile && audioElRef.current) {
        audioElRef.current.src = product.audioFile;
        audioElRef.current.play().catch(() => {});
      }
    },
    [],
  );

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      wheelDeltaRef.current += event.deltaY;
      while (Math.abs(wheelDeltaRef.current) >= WHEEL_STEP_THRESHOLD) {
        if (wheelDeltaRef.current > 0) {
          moveWheel(1);
          wheelDeltaRef.current -= WHEEL_STEP_THRESHOLD;
        } else {
          moveWheel(-1);
          wheelDeltaRef.current += WHEEL_STEP_THRESHOLD;
        }
      }
    },
    [moveWheel],
  );

  const activeProduct = useMemo(() => {
    if (hoveredId) {
      return products.find((item) => item.id === hoveredId) ?? null;
    }
    if (selectedId) {
      return products.find((item) => item.id === selectedId) ?? null;
    }
    return products[centerIndex] ?? null;
  }, [hoveredId, selectedId, products, centerIndex]);

  useEffect(() => {
    if (!activeProduct?.audioFile || !audioElRef.current) {
      return;
    }
    audioElRef.current.src = activeProduct.audioFile;
    audioElRef.current.play().catch(() => {});
  }, [activeProduct?.audioFile, activeProduct?.id]);

  if (products.length === 0) {
    return (
      <main className={styles.empty}>
        <HamburgerMenu />
        No products yet. Add your first one from <a href="/admin">/admin</a>.
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <HamburgerMenu />
      <section className={styles.captionColumn}>
        <VoiceoverPlayer
          product={activeProduct}
          setAudioElementRef={(el) => {
            audioElRef.current = el;
          }}
        />
      </section>
      <section className={styles.wheelColumn}>
        <div className={styles.wheelViewport} onWheel={onWheel}>
          <div className={styles.centerGuide} />
          <div className={styles.wheelStage}>
            {products.map((product, index) => {
              const rawOffset = index - centerIndex;
              let circularOffset = rawOffset;
              const half = Math.floor(products.length / 2);
              if (rawOffset > half) {
                circularOffset = rawOffset - products.length;
              } else if (rawOffset < -half) {
                circularOffset = rawOffset + products.length;
              }

              if (Math.abs(circularOffset) > MAX_VISIBLE_OFFSET) {
                return null;
              }

              const visuals = getVisuals(Math.abs(circularOffset));
              return (
                <div
                  key={product.id}
                  className={styles.row}
                  style={{
                    transform: `translate(-50%, calc(-50% + ${circularOffset * ITEM_GAP}px))`,
                    zIndex: 100 - Math.abs(circularOffset),
                  }}
                >
                  <ProductItem
                    product={product}
                    scale={visuals.scale}
                    opacity={visuals.opacity}
                    isActive={index === centerIndex}
                    isSelected={selectedId === product.id}
                    onHoverStart={(item) => setHoveredId(item.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    onSelect={(item) => {
                      setCenterIndex(index);
                      handleSelect(item);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
