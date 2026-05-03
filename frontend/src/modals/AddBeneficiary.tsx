
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ModalLayout from "@/layouts/ModalLayout";
import FormInput from "@/components/FormInput";

interface formProps{
    name:string;
    address:string;
    allocation:number;
    email:string;
    phoneNo:string;
}

const AddBeneficiary = ({ onClose }: { onClose: () => void }) => {
  const [form,setForm] = useState<formProps>({
    name:"",address:"",allocation:0,email:"",phoneNo:""
  });

  const [errors, setErrors] = useState<any>({});
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ VALIDATION
  const validate = () => {
    let err:any = {};

    if (!form.name.trim()) err.name = "Name is required";

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Invalid email";

    if (!form.address || !/^0x[a-fA-F0-9]{40}$/.test(form.address))
      err.address = "Invalid wallet address";

    if (form.allocation <= 0)
      err.allocation = "Allocation must be greater than 0";

    if (!/^\d{1,11}$/.test(form.phoneNo))
      err.phoneNo = "Phone must be numbers only (max 11 digits)";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handlePhoneChange = (value:string) => {
    const cleaned = value.replace(/\D/g, "").slice(0,11);
    setForm({...form, phoneNo: cleaned});
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    // 👉 your actual submit logic here
    onClose();
  };

  useEffect(()=>{setTimeout(()=>{setErrors({name:"",email:"",address:"",allocation:"",phoneNo:""})},3000)},[errors])

  return (
    <>
      <ModalLayout onClose={onClose} maxWidth="max-w-xl">
        <div className="rounded-t-2xl bg-white px-6 pb-6 pt-5 sm:rounded-2xl sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">
                Add beneficiary
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Assign distribution for your digital legacy
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <FormInput
              label="Beneficiary name / label"
              id="beneficiary-name"
              value={form.name}
              placeholder="e.g., Family Trust or Sarah Smith"
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

            <FormInput
              label="Email address"
              id="beneficiary-email"
              value={form.email}
              placeholder="beneficiary email"
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

            <FormInput
              label="Phone Number"
              id="beneficiary-phone"
              value={form.phoneNo}
              placeholder="beneficiary phone number"
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
            {errors.phoneNo && <p className="text-red-500 text-xs">{errors.phoneNo}</p>}

            <FormInput
              label="Wallet address"
              id="beneficiary-wallet"
              value={form.address}
              placeholder="0x..."
              onChange={(e) => setForm({...form, address: e.target.value})}
            />
            {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

            <div>
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="allocation"
                  className="text-sm font-medium text-slate-700"
                >
                  Allocation percentage
                </label>
                <span className="text-sm font-semibold text-slate-950">
                  {form.allocation}%
                </span>
              </div>
              <input
                id="allocation"
                type="range"
                min={0}
                max={100}
                value={form.allocation}
                onChange={(e) => setForm({...form, allocation: Number(e.target.value)})}
                className="mt-3 w-full cursor-pointer accent-primary"
              />
            </div>
            {errors.allocation && <p className="text-red-500 text-xs">{errors.allocation}</p>}

            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
              Total allocation must not exceed 100%. Current: 70%.
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Add beneficiary
            </button>
          </div>
        </div>
      </ModalLayout>

      {/* ✅ CONFIRMATION MODAL */}
      {showConfirm && (
        <ModalLayout onClose={() => setShowConfirm(false)} maxWidth="max-w-md">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm Details
            </h3>

            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Phone:</strong> {form.phoneNo}</p>
              <p><strong>Wallet:</strong> {form.address}</p>
              <p><strong>Allocation:</strong> {form.allocation}%</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-full border px-4 py-2 text-sm"
              >
                Edit
              </button>
              <button
                onClick={confirmSubmit}
                className="rounded-full bg-primary px-4 py-2 text-sm text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </ModalLayout>
      )}
    </>
  );
};

export default AddBeneficiary;