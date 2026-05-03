import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWillOwner } from '@/hooks/child/useWillOwner'

export default function Header() {
  const location  = useLocation()
  const pathname  = location.pathname
  const navigate  = useNavigate()
  const { address, isConnected } = useAccount()
  const { ownsWill, isLoading: isCheckingWill } = useWillOwner(address)

  const navItems = [
    { label: 'Home',         href: '/'            },
    { label: 'About',        href: '/about'        },
    { label: 'How It Works', href: '/how-it-works' },
  ]

  return (
    <header className="fixed z-50 w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

        {/* logo */}
        <Link
          className="text-xl !text-primary !font-extrabold tracking-wide "
          to="/"
        >
          ChainWill
        </Link>

        {/* nav links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors ${
                  isActive
                    ? 'border-b-2 border-indigo-700 text-indigo-700'
                    : 'hover:text-indigo-700'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* right side actions */}
        <div className="flex items-center gap-3">

          {/* dashboard / create will button — shown only when connected */}
          {isConnected && !isCheckingWill && (
            ownsWill ? (
              <button
                onClick={() => navigate('/auth/overview')}
                type="button"
                className="rounded-xl bg-primary px-5 py-2 !text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Visit Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/create-will')}
                type="button"
                className="rounded-xl bg-primary px-5 py-2 !text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Create New Will
              </button>
            )
          )}

          <ConnectButton
            accountStatus="address"   // show shortened address when connected
            chainStatus="icon"        // show chain icon only
            showBalance={false}       // hide token balance in button
            label="Connect Wallet"    // button text when disconnected
          />
        </div>
      </nav>
    </header>
  )
}
