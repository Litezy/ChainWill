import { ShieldCheck } from "lucide-react";
import React from "react";

const CheckinButton:React.FC = () => {
  return (
    <button className="inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-full bg-indigo-950 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary/90">
      <span>
        <ShieldCheck size={20} className="text-white" />
      </span>{" "}
      I'm Alive Check-in
    </button>
  );
};

export default CheckinButton;
