import AssetBalanceCard from '@/components/dashboard/AssetBalanceCard';
import CurrentAssetsCard from '@/components/dashboard/CurrentAssetsCard';
import FundingTransactionsCard from '@/components/dashboard/FundingTransactionsCard';
import TokenApprovalCard from '@/components/dashboard/TokenApprovalCard';
import CheckinButton from '@/components/ui/CheckinButton';
import { useWillStatus } from '@/hooks/child/useWillStatus';
import { useWillStatusStore } from '@/stores/willStatusStore';

const Assets = () => {
  useWillStatus();
  const isLoading = useWillStatusStore((state) => state.isLoading);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Digital testament assets</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="inline-flex items-center rounded-full bg-rose-100 p-3 text-sm font-semibold text-rose-700">
            Protocol Status
          </span>
          <CheckinButton/>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AssetBalanceCard isLoading={isLoading} />
        <CurrentAssetsCard isLoading={isLoading} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <TokenApprovalCard />
        <FundingTransactionsCard />
      </div>
    </div>
  );
};

export default Assets;
