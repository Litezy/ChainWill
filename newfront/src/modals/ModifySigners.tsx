
import { useState } from 'react';
import { X } from 'lucide-react';
import ModalLayout from '@/layouts/ModalLayout';
import FormInput from '@/components/FormInput';

type AddSignerPayload = {
  name: string;
  address: string;
  email: string;
};

const ModifySigners = ({
  onClose,
  onAddSigner,
}: {
  onClose: () => void;
  onAddSigner: (signer: AddSignerPayload) => void;
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !address.trim() || !email.trim()) {
      return;
    }

    onAddSigner({
      name: name.trim(),
      address: address.trim(),
      email: email.trim(),
    });
  };

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-xl">
      <div className="rounded-t-2xl bg-white px-6 pb-6 pt-5 sm:rounded-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Modify trusted signer</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Modify Signer Thorne</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <FormInput
            label="Signer name"
            id="signer-name"
            value={name}
            placeholder="e.g., Jane Doe"
            onChange={(event) => setName(event.target.value)}
          />

          <FormInput
            label="Wallet address"
            id="signer-wallet"
            value={address}
            placeholder="0x..."
            onChange={(event) => setAddress(event.target.value)}
          />

          <FormInput
            label="Reminder email"
            id="signer-email"
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(event) => setEmail(event.target.value)}
            helperText="This email will be used to notify the signer when the owner is unavailable."
          />


          <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
            Reminder emails are only used for notification and do not grant on-chain authority.
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
            Save
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default ModifySigners;
