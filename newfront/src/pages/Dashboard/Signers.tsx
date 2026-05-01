'use client';

import { useState } from 'react';
import { ShieldCheck, UserCircle2, Plus } from 'lucide-react';
import ModifySigners from '@/modals/ModifySigners';

type Signer = {
  name: string;
  address: string;
  email: string;
  badge: string;
  badgeClass: string;
};

const initialSigners: Signer[] = [
  {
    name: 'Sarah Miller',
    address: '0x71c...492d',
    email: 'sarah@trustmail.com',
    badge: 'Ready',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Marcus Thorne',
    address: '0x3A2...9bB1',
    email: 'marcus@lawchain.com',
    badge: 'Ready',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Marcus Thore 3',
    address: '0x3A2...9bB1',
    email: 'marcus@lawchain.com',
    badge: 'Ready',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
];


const Signers = () => {
  const [openSigner, setOpenSigner] = useState(false);
  const [signers,] = useState<Signer[]>(initialSigners);

  const handleAddSigner = () => {
    
    setOpenSigner(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Signers & Guardians</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Dashboard guardian controls</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add signer name, wallet address, and email reminders so trusted verifiers are notified when the owner is unavailable.
          </p>
        </div>

        
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Protocol integrity</p>
              <p className="mt-3 text-base font-semibold text-slate-950">Multisig threshold</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-6 rounded-[28px] bg-slate-50 p-5">
            <p className="text-3xl font-semibold text-slate-950">2 / 3</p>
            <p className="mt-2 text-sm text-slate-500">Safe threshold: 67% consensus required.</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[67%] rounded-full bg-primary" />
            </div>
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Active signers
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-primary p-6 text-white shadow-sm shadow-primary/20">
          <p className="text-sm font-semibold uppercase text-primary/90">Email reminders</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Keep your signers notified</h2>
          <p className="mt-4 text-sm leading-7 text-slate-100">
            Signer emails are used to send secure reminders if the owner cannot attend the attest trigger.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-slate-100">
              Reminder policy
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              Manage signers
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {signers.map((guardian) => (
          <div key={`${guardian.address}-${guardian.email}`} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${guardian.badgeClass}`}>
                {guardian.badge}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-lg font-semibold text-slate-950">{guardian.name}</p>
              <div className="space-y-1 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-950">Wallet</span>: {guardian.address}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Reminder email</span>: {guardian.email}
                </p>
              </div>
              <button 
              onClick={()=> setOpenSigner(true)}
              className='!text-sm text-white bg-primary px-3 py-1.5 rounded-full '>Replace/Edit</button>
            </div>
          </div>
        ))}

       
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-sm font-semibold text-slate-700">Signer health & reminders</p>
        </div>
        <div className="overflow-x-auto px-6 py-6">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3">Signer</th>
                <th className="px-4 py-3">Email reminder</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {signers.map((guardian) => (
                <tr key={`${guardian.address}-row`} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-500">{guardian.email}</td>
                  <td className="px-4 py-4 text-slate-500">ETH · POL</td>
                  <td className="px-4 py-4 text-emerald-700">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-500">
          Reminder emails are stored for off-chain notifications once the owner becomes unavailable.
        </div>
      </div>

      {openSigner && <ModifySigners onClose={() => setOpenSigner(false)} onAddSigner={handleAddSigner} />}
    </div>
  );
};

export default Signers;
