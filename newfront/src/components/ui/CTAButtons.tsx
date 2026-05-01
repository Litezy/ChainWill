
interface btnProps{
    onClick:()=> void;
    disabled:boolean;
    title:string
}

interface closeBtnProps{
  onClose: ()=>void;
}
export const ActionButton = ({ onClick, disabled, title }: btnProps) => {
  return (
    <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {title}
          </button>
  )
}




export const CloseButton = ({ onClose }: closeBtnProps) => {
  return (
    <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>

  )
}