"use client";
import React, { useEffect, useState } from "react";

interface ModalLayoutProps {
  children: React.ReactNode;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
  maxWidth?: string;
}

const ModalLayout: React.FC<ModalLayoutProps> = ({
  children,
  onClose,
  closeOnOutsideClick = true,
  maxWidth = "max-w-md",
}) => {
  // Drive the enter/exit animation
  const [visible, setVisible] = useState(false);

  // Trigger enter on mount
  useEffect(() => {
    // Small rAF so the browser paints the "hidden" state first, then transitions in
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Animate out then call onClose
  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300); // match transition duration
  }

  return (
    // Backdrop
    <div
      className={`
        fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center
        transition-[background-color] duration-300
        ${visible ? "bg-black/80" : "bg-black/0"}
      `}
      onClick={closeOnOutsideClick ? handleClose : undefined}
    >
      {/* Panel */}
      <div
        className={`
          w-full ${maxWidth} bg-white
          rounded-t-2xl sm:rounded-2xl sm:mx-4
          overflow-auto max-h-[95dvh] shadow-lg
          transition-[transform,opacity] duration-300 ease-out will-change-transform
          ${visible ? "translate-y-0" : "translate-y-full"}
          ${visible
            ? "sm:translate-y-0 sm:scale-100 sm:opacity-100"
            : "sm:translate-y-4 sm:scale-95 sm:opacity-0"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {children}
      </div>
    </div>
  );
};

export default ModalLayout;