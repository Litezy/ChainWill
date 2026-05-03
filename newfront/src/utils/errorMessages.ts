import toast from "react-hot-toast"

const styles = {
    background: "#021064",
    color: "white"
}

// const iconThemes = {
//     primary: "green",
//     secondary: "red"
// }

export const successMessage = (msg:string): string=> {
  return toast.success(msg || "Success", {
    style: styles,

    // iconTheme:iconThemes
  });
}

export const errorMessage = (msg:string): string => {
    return toast.error(msg || "Something went wrong", {
        style: styles
    });
}