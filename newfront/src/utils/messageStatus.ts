import toast from "react-hot-toast"

// 🎨 shared styles
const baseStyle = {
  borderRadius: "10px",
  fontSize: "14px",
  padding: "12px 16px",
}

// SUCCESS
export const successMessage = (msg?: string) => {
  return toast.success(msg || "Success", {
    style: {
      ...baseStyle,
      background: "#021064",
      color: "#fff",
    },
    iconTheme: {
      primary: "#60a5fa",   
      secondary: "#021064", 
    },
  })
}

// ERROR
export const errorMessage = (msg?: string) => {
  return toast.error(msg || "Something went wrong", {
    style: {
      ...baseStyle,
      background: "#450a0a", // deep red
      color: "#fecaca",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#450a0a",
    },
  })
}

// ⏳ LOADING
export const loadingMessage = (msg?: string) => {
  return toast.loading(msg || "Processing...", {
    style: {
      ...baseStyle,
      background: "#020617", 
      color: "#e2e8f0",
    },
  })
}

// 🧹 DISMISS (important for loading)
export const dismissToast = (id: string) => {
  toast.dismiss(id)
}