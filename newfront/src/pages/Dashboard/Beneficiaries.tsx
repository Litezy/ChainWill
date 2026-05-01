
import { useState } from 'react';
import { Plus, UserPlus, ShieldCheck, FileText, Edit2, Trash2 } from 'lucide-react';
import AddBeneficiary from '@/modals/AddBeneficiary';
import UpdateBeneficiary from '@/modals/UpdateBeneficiary';

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

const initialBeneficiaries: Beneficiary[] = [
  {
    name: 'Eleanor Vance',
    role: 'Daughter · Primary',
    address: '0x71c...4f92',
    email: 'eleanor@example.com',
    phone: '+1 (555) 123-4567',
    share: '40%',
    status: 'Active',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Julian Vance',
    role: 'Son · Secondary',
    address: '0x3aB...E912',
    email: 'julian@example.com',
    phone: '+1 (555) 987-6543',
    share: '30%',
    status: 'Active',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Crypto Hands NGO',
    role: 'Charity · Tertiary',
    address: '0x9F2...D082',
    email: 'contact@cryptohands.org',
    phone: '+1 (555) 456-7890',
    share: '15%',
    status: 'Pending',
    statusClass: 'bg-amber-100 text-amber-700',
  },
];

const Beneficiaries = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);

  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setOpenUpdate(true);
  };

  const handleUpdate = (updated: Beneficiary, updateType: 'percentage' | 'address') => {
    setBeneficiaries((current) =>
      current.map((b) => (b.address === updated.address ? updated : b))
    );
    // Here you would call the contract function based on updateType
    console.log('Updating beneficiary:', updated, 'Type:', updateType);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Beneficiaries</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Registered beneficiary controls</h1>
        </div>

        <button
          type="button"
          onClick={() => setOpenAdd(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add beneficiary
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Total allocation</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">85%</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-500">Unallocated remaining</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">15%</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-100 p-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[85%] rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-sm text-slate-500">Distributing 12,450.00 ETH equivalent</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-semibold uppercase text-slate-500">Beneficiary count</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold text-slate-950">06</p>
              <p className="text-sm text-slate-500">Verified identities</p>
            </div>
            <div className="flex -space-x-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">EV</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">JV</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">CH</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">+3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Registered beneficiaries</p>
            <p className="text-sm text-slate-500">Manage individuals who will receive assets upon testament execution.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add beneficiary
          </button>
        </div>

        <div className="overflow-x-auto px-6 py-6">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Wallet address</th>
                <th className="px-4 py-3">Share (%)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {beneficiaries.map((item) => (
                <tr key={item.address} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.role}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{item.address}</td>
                  <td className="px-4 py-4 font-semibold text-slate-950">{item.share}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.statusClass}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 transition hover:bg-rose-100 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500">
          Beneficiaries must verify their identity via zero-knowledge proof before the 'Pending' status is cleared.
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-primary text-white p-6 shadow-sm shadow-primary/20">
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-sm font-semibold">Smart Verification</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-100">
            Beneficiaries added to your digital testament are automatically notified to link their decentralized identifiers (DIDs) for secure legacy transfer.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3 text-slate-950">
            <FileText className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-slate-950">Legal Validity</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Each beneficiary registration is timestamped on the blockchain, creating an immutable paper trail that holds technical finality.
          </p>
        </div>
      </div>

      {openAdd && <AddBeneficiary onClose={() => setOpenAdd(false)} />}
      {openUpdate && selectedBeneficiary && (
        <UpdateBeneficiary
          beneficiary={selectedBeneficiary}
          onClose={() => setOpenUpdate(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Beneficiaries;
