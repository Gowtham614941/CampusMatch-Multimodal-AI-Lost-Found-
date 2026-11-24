import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { STUDENT_SSO_USER } from '../data/mockItems';
import { FoundItem, ItemCategory } from '../types/campusMatch';
import { ItemPhoto } from './ItemPhoto';

interface StudentPortalProps {
  items: FoundItem[];
  onSubmitClaim: (itemId: string, proofAnswer: string) => string;
  onSwitchToAdmin: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'All',
  'Electronics',
  'Apparel',
  'Bottles & Bags',
  'Keys & IDs',
];

export function StudentPortal({
  items,
  onSubmitClaim,
  onSwitchToAdmin,
}: StudentPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All');
  const [notifyMe, setNotifyMe] = useState(false);
  const [showSsoMenu, setShowSsoMenu] = useState(false);

  const [activeClaimItem, setActiveClaimItem] = useState<FoundItem | null>(null);
  const [proofAnswer, setProofAnswer] = useState('');
  const [claimError, setClaimError] = useState('');
  const [submittedClaimRef, setSubmittedClaimRef] = useState<string | null>(null);

  const availableItems = useMemo(
    () => items.filter((item) => item.status === 'found'),
    [items],
  );

  const myPendingClaims = useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === 'pending' &&
          item.claim?.claimantEmail === STUDENT_SSO_USER.email,
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.locationFound,
        item.category,
        ...item.aiTags,
      ]
        .join(' ')
        .toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [availableItems, searchQuery, selectedCategory]);

  const handleOpenClaimModal = (item: FoundItem) => {
    setActiveClaimItem(item);
    setProofAnswer('');
    setClaimError('');
    setSubmittedClaimRef(null);
  };

  const handleCloseModal = () => {
    setActiveClaimItem(null);
    setProofAnswer('');
    setClaimError('');
    setSubmittedClaimRef(null);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaimItem) return;
    if (proofAnswer.trim().length < 8) {
      setClaimError(
        'Please provide a few specific details (at least 8 characters) to verify ownership.',
      );
      return;
    }
    const refId = onSubmitClaim(activeClaimItem.id, proofAnswer.trim());
    setSubmittedClaimRef(refId);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar (Strict 3-zone contract, <=56px mobile height) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-lg py-1"
          >
            <span className="h-8 w-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-display font-bold text-sm tracking-tight">
              CM
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">
              CampusMatch
            </span>
          </a>

          {/* Zone 2: Clean single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => scrollToSection('found-feed')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Found Feed
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Verification
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('campus-desks')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Pickup Desks
            </button>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="hover:text-blue-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Staff Portal
            </button>
          </nav>

          {/* Zone 3: University SSO Avatar Action */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSsoMenu((prev) => !prev)}
              aria-expanded={showSsoMenu}
              aria-label="University SSO account menu"
              className="min-h-[44px] flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            >
              <img
                src={STUDENT_SSO_USER.avatarUrl}
                alt={STUDENT_SSO_USER.name}
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-full object-cover bg-slate-200"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800 whitespace-nowrap shrink-0">
                <span className="hidden sm:inline">{STUDENT_SSO_USER.name}</span>
                <span className="sm:hidden">SSO</span>
              </span>
            </button>

            {showSsoMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowSsoMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-lg p-3.5 z-40">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-900 mb-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>University SSO Verified</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {STUDENT_SSO_USER.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {STUDENT_SSO_USER.email}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                      {STUDENT_SSO_USER.studentId}
                    </p>
                  </div>

                  <div className="pt-2.5 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSsoMenu(false);
                        onSwitchToAdmin();
                      }}
                      className="w-full min-h-[40px] px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-900 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>Open Admin / Staff Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-7 sm:pt-12 sm:pb-10">
          <div className="text-center">
            <p className="text-xs sm:text-sm font-medium text-blue-900 mb-2">
              Official Campus Lost &amp; Found Directory
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance max-w-2xl mx-auto">
              Find what you left behind on campus
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 max-w-xl mx-auto">
              Search items logged across campus desks. Photos remain masked
              during claims so only the owner can verify details.
            </p>
          </div>

          {/* Search Input */}
          <div className="mt-6 sm:mt-8">
            <label htmlFor="lost-item-search" className="sr-only">
              Search lost items
            </label>
            <div className="relative flex items-center">
              <Search
                className="h-5 w-5 text-slate-400 absolute left-4 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="lost-item-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What did you lose? (e.g., black hydro flask with stickers)"
                className="w-full min-h-[52px] sm:min-h-[56px] pl-12 pr-12 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Notify Me Toggle Row */}
            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyMe}
                  id="notify-me-toggle"
                  onClick={() => setNotifyMe((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 ${
                    notifyMe ? 'bg-blue-900' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      notifyMe ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <label
                  htmlFor="notify-me-toggle"
                  className="text-sm text-slate-700 cursor-pointer select-none flex items-center gap-1.5"
                >
                  <Bell className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>Email me if a match is found later</span>
                </label>
              </div>

              {notifyMe && (
                <p className="text-xs font-medium text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Alert active for {STUDENT_SSO_USER.email}
                    {searchQuery.trim() ? ` (“${searchQuery.trim()}”)` : ''}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Interactive Category Filter Buttons */}
          <div
            className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
            role="tablist"
            aria-label="Filter found items by category"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 ${
                    active
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
        {/* Submitted Claims Banner (only shown if student submitted a claim this session) */}
        {myPendingClaims.length > 0 && (
          <section
            aria-label="Your submitted claims"
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h2 className="font-display text-sm sm:text-base font-semibold text-slate-900">
                Your Pending Verification Claims ({myPendingClaims.length})
              </h2>
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-xs font-medium text-blue-900 hover:underline self-start sm:self-auto"
              >
                Inspect in Staff Portal
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {myPendingClaims.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      Ref {item.claim?.claimRef} · {item.pickupDesk}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-amber-700 whitespace-nowrap shrink-0">
                    Pending Staff Review
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Found Items Feed (Mobile-first 2-column grid -> 3/4 columns on larger viewports) */}
        <section id="found-feed" aria-label="Recently found items">
          <div className="flex items-baseline justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-slate-900">
                Recently Found Items
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 tabular-nums">
                Showing {filteredItems.length} unclaimed{' '}
                {filteredItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="md:hidden min-h-[40px] px-3 py-1.5 text-xs font-medium text-blue-900 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Staff View
            </button>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenClaimModal(item)}
                  className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-900/40 hover:shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 flex flex-col"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <ItemPhoto
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900 leading-snug line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.foundRelativeTime}
                        <span aria-hidden="true"> · </span>
                        {item.locationFound.split(' — ')[0]}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-900">
                      <span>Claim item</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto">
              <p className="font-display text-base sm:text-lg font-semibold text-slate-900">
                No matching items found yet
              </p>
              <p className="text-sm text-slate-600 mt-1.5">
                New items are logged throughout the day by campus staff. Turn on
                email alerts so we can notify you automatically.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {!notifyMe && (
                  <button
                    type="button"
                    onClick={() => setNotifyMe(true)}
                    className="min-h-[44px] px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    Notify Me of Future Matches
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="min-h-[44px] px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </section>

        {/* How Verification Works & Campus Desks */}
        <section
          id="how-it-works"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200"
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-blue-900 mb-2">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="font-display text-base font-semibold text-slate-900">
                Ownership Verification Policy
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you open a claim, CampusMatch hides detailed photographs and
              asks a specific question generated from intake inspection. Campus
              staff compare your answer with the item in custody before
              releasing it with your Student ID.
            </p>
          </div>

          <div
            id="campus-desks"
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 text-blue-900 mb-2">
              <MapPin className="h-5 w-5" />
              <h2 className="font-display text-base font-semibold text-slate-900">
                Campus Pickup Desks
              </h2>
            </div>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>Student Union Info Desk (Rm 102) · Mon–Fri 8:00 AM–8:00 PM</li>
              <li>Main Library Circulation Desk · Daily 7:30 AM–11:00 PM</li>
              <li>Campus Safety &amp; Facilities Office · Open 24/7</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Claim Modal (Mobile Bottom-Sheet / Desktop Centered Dialog) */}
      {activeClaimItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Drag handle on mobile */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <span className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h2
                  id="claim-modal-title"
                  className="font-display text-lg font-semibold text-slate-900"
                >
                  {submittedClaimRef ? 'Claim Submitted' : 'Verify Ownership'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeClaimItem.title} · {activeClaimItem.foundRelativeTime}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close claim dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {submittedClaimRef ? (
                <div className="py-4 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    Your claim is with campus staff
                  </h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto">
                    Reference{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      {submittedClaimRef}
                    </span>{' '}
                    has been routed to{' '}
                    <span className="font-medium text-slate-800">
                      {activeClaimItem.pickupDesk}
                    </span>
                    . You will receive an email at {STUDENT_SSO_USER.email} once
                    approved.
                  </p>
                  <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 min-h-[44px] px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition-colors"
                    >
                      Back to Found Feed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseModal();
                        onSwitchToAdmin();
                      }}
                      className="flex-1 min-h-[44px] px-4 py-2.5 bg-slate-100 text-slate-800 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Review in Staff Portal
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  {/* Masked Photo Shield */}
                  <ItemPhoto
                    src={activeClaimItem.imageUrl}
                    alt={activeClaimItem.title}
                    hiddenForVerification={true}
                    className="w-full h-44 rounded-xl"
                  />

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Found at {activeClaimItem.locationFound}</span>
                    <span aria-hidden="true">·</span>
                    <span>Held at {activeClaimItem.pickupDesk}</span>
                  </div>

                  <div>
                    <label
                      htmlFor="proof-answer-input"
                      className="block text-sm font-semibold text-slate-900 mb-1.5"
                    >
                      Proof of Ownership
                    </label>
                    <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
                      {activeClaimItem.proofQuestion}
                    </p>
                    <textarea
                      id="proof-answer-input"
                      rows={4}
                      value={proofAnswer}
                      onChange={(e) => {
                        setProofAnswer(e.target.value);
                        if (claimError) setClaimError('');
                      }}
                      placeholder="Describe identifying details only you would know..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                    />
                    {claimError && (
                      <p className="text-xs font-medium text-red-600 mt-1.5">
                        {claimError}
                      </p>
                    )}
                  </div>

                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 active:scale-[0.99] transition-all"
                    >
                      Submit Claim
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
