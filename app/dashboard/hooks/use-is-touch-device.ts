"use client";

import { useState, useEffect } from "react";

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState<boolean | null>(null);
  useEffect(() => {
    setIsTouch(
      window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0
    );
  }, []);
  return isTouch;
}
