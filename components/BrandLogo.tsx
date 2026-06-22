"use client";

import { useState } from "react";

export function BrandLogo({
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  fallbackText = "Вільшанка",
}: {
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallbackText?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className={`flex shrink-0 items-center justify-center ${className}`}>
      {imageFailed ? (
        <span className={fallbackClassName}>{fallbackText}</span>
      ) : (
        // Звичайний img дозволяє показати текстовий fallback, якщо власник
        // ще не додав логотип до public/images.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/logo-vilshanka.png"
          alt="Логотип Вільшанки"
          className={`h-full w-full object-contain ${imageClassName}`}
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}
