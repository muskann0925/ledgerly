import { useEffect, useRef, type RefObject } from "react";

/**
 * Custom hook to handle outside click/touch events and Escape key presses for dropdowns/popovers
 * @param onClose Handler function called when an outside click or Escape key occurs
 * @param isOpen Optional boolean flag indicating whether the overlay is currently open
 */
export function useOutsideClick<T extends HTMLElement = HTMLDivElement>(
  onClose: () => void,
  isOpen: boolean = true
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("touchstart", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("touchstart", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return ref;
}
