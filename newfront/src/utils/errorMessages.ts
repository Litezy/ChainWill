import toast from "react-hot-toast"

export const successMessage = (msg:string): string=>{
  return toast.success(msg || "Success");
}

export const errorMessage = (msg:string): string => {
    return toast.error(msg || "Something went wrong");
}