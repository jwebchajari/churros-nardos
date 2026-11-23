"use client";
import { useState } from "react";
import { cldUrl, isCloudinary } from "@/lib/cloudinary-url";
import s from "./menu.module.css";

/** <img> lazy con fallback de marca. Si es Cloudinary pide una versión redimensionada. */
export default function ProductImage({ src, alt, width = 480, className = "", eager = false, ratio = "1 / 1" }) {
  const [failed, setFailed] = useState(false);
  const url = src && isCloudinary(src) ? cldUrl(src, `f_auto,q_auto,c_fill,w_${width}`) : src;

  if (!url || failed) {
    return (
      <div className={`${s.imgFallback} ${className}`} style={{ aspectRatio: ratio }} {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}>
        <img src="/logo-sm.webp" alt="" width={56} height={56} loading="lazy" />
      </div>
    );
  }
  return (
     
    <img
      src={url}
      alt={alt}
      className={`${s.img} ${className}`}
      style={{ aspectRatio: ratio }}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
