type Signer = {
  name: string;
  address: string;
  email: string;
};

type Props = {
  selectedToken: { symbol: string; label: string };
  ownerName: string;
  ownerEmail: string;
  signers: Signer[];
};

const StepThree = ({
  selectedToken,
  ownerName,
  ownerEmail,
  signers,
}: Props) => {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-900">Selected token</p>
        <p className="mt-3 text-base text-slate-950">{selectedToken.label}</p>
        {/* <p className="text-sm text-slate-500">Balance: {displayBalance}</p> */}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-900">Owner details</p>
        <p className="mt-3 text-base text-slate-950">{ownerName}</p>
        <p className="text-sm text-slate-500">{ownerEmail}</p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-900">
          Signer summary ({signers.length})
        </p>
        <div className="mt-4 space-y-3">
          {signers.map((signer, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm"
            >
              <p><strong>Name:</strong> {signer.name}</p>
              <p><strong>Address:</strong> {signer.address}</p>
              <p><strong>Email:</strong> {signer.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepThree;