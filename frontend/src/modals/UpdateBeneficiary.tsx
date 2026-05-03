
import { useState } from 'react';
import { X } from 'lucide-react';
import ModalLayout from '@/layouts/ModalLayout';
import FormInput from '@/components/FormInput';

type Beneficiary = {
  name: string;
  role: string;
  address: string;
  email: string;
  phone: string;
  share: string;
  status: string;
  statusClass: string;
};

type UpdateBeneficiaryProps = {
  beneficiary: Beneficiary;
  onClose: () => void;
  onUpdate: (updated: Beneficiary, updateType: 'percentage' | 'address') => void;
};

const UpdateBeneficiary = ({ beneficiary, onClose, onUpdate }: UpdateBeneficiaryProps) => {
  const [updateType, setUpdateType] = useState<'percentage' | 'address' | null>(null);
  const [name, setName] = useState(beneficiary.name);
  const [email, setEmail] = useState(beneficiary.email);
  const [phone, setPhone] = useState(beneficiary.phone);
  const [address, setAddress] = useState(beneficiary.address);
  const [share, setShare] = useState(parseInt(beneficiary.share.replace('%', '')));

  const handleSave = () => {
    if (!updateType) return;
    const updated: Beneficiary = {
      ...beneficiary,
      name,
      email,
      phone,
      address: updateType === 'address' ? address : beneficiary.address,
      share: updateType === 'percentage' ? `${share}%` : beneficiary.share,
    };
    onUpdate(updated, updateType);
    onClose();
  };

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-2xl">
      <div className="rounded-t-2xl bg-white px-6 pb-6 pt-5 sm:rounded-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Update beneficiary</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Modify beneficiary details</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">What would you like to update?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUpdateType('percentage')}
                className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  updateType === 'percentage'
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Update Percentage
              </button>
              <button
                type="button"
                onClick={() => setUpdateType('address')}
                className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  updateType === 'address'
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Update Address
              </button>
            </div>
          </div>

          <FormInput
            label="Name"
            id="beneficiary-name"
            value={name}
            placeholder="e.g., John Doe"
            onChange={(event) => setName(event.target.value)}
          />

          <FormInput
            label="Email"
            id="beneficiary-email"
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />

          <FormInput
            label="Phone"
            id="beneficiary-phone"
            value={phone}
            placeholder="+1 (555) 123-4567"
            onChange={(event) => setPhone(event.target.value)}
          />

          {updateType === 'percentage' && (
            <div>
              <label htmlFor="share" className="mb-2 block text-sm font-medium text-slate-700">
                Share Percentage
              </label>
              <input
                id="share"
                type="number"
                min={0}
                max={100}
                value={share}
                onChange={(event) => setShare(Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {updateType === 'address' && (
            <FormInput
              label="Wallet Address"
              id="beneficiary-address"
              value={address}
              placeholder="0x..."
              onChange={(event) => setAddress(event.target.value)}
            />
          )}
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
            onClick={handleSave}
            disabled={!updateType}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Beneficiary
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default UpdateBeneficiary;