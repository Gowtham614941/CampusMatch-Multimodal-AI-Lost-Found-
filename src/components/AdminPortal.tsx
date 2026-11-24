import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MapPin,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  CAMPUS_LOCATIONS,
  INTAKE_PRESETS,
  PICKUP_DESKS,
} from '../data/mockItems';
import {
  AdminSection,
  FoundItem,
  IntakePreset,
  ItemCategory,
} from '../types/campusMatch';
import { ItemPhoto } from './ItemPhoto';

interface AdminPortalProps {
  items: FoundItem[];
  onAddFoundItem: (
    newItem: Omit<FoundItem, 'id' | 'foundRelativeTime' | 'status'>,
  ) => void;
  onApproveReturn: (itemId: string, studentIdNumber: string) => void;
  onRejectClaim: (itemId: string) => void;
  onSwitchToStudent: () => void;
}

interface DraftIntake {
  imageUrl: string;
  title: string;
  category: Exclude<ItemCategory, 'All'>;
  locationFound: string;
  pickupDesk: string;
  aiTags: string[];
  proofQuestion: string;
}

export function AdminPortal({
  items,
  onAddFoundItem,
  onApproveReturn,
  onRejectClaim,
  onSwitchToStudent,
}: AdminPortalProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [inventorySearch, setInventorySearch] = useState('');

  // Quick Intake & Gemini AI Preview state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draftIntake, setDraftIntake] = useState<DraftIntake | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [intakeSuccessNotice, setIntakeSuccessNotice] = useState<string | null>(
    null,
  );

  // Resolution Modal state
  const [selectedPendingItem, setSelectedPendingItem] =
    useState<FoundItem | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [custodyError, setCustodyError] = useState('');

  // Settings state
  const [retentionDays, setRetentionDays] = useState('60');
  const [ssoDomain, setSsoDomain] = useState('university.edu');
  const [autoEmailMatches, setAutoEmailMatches] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const filteredItems = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = [
        item.id,
        item.title,
        item.locationFound,
        ...item.aiTags,
        item.claim?.claimantName ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
  }, [items, inventorySearch]);

  const foundColumn = useMemo(
    () => filteredItems.filter((i) => i.status === 'found'),
    [filteredItems],
  );
  const pendingColumn = useMemo(
    () => filteredItems.filter((i) => i.status === 'pending'),
    [filteredItems],
  );
  const returnedColumn = useMemo(
    () => filteredItems.filter((i) => i.status === 'returned'),
    [filteredItems],
  );

  const runMockGeminiExtraction = (preset: IntakePreset) => {
    setIntakeSuccessNotice(null);
    setIsAnalyzing(true);
    window.setTimeout(() => {
      setDraftIntake({
        imageUrl: preset.imageUrl,
        title: preset.title,
        category: preset.category,
        locationFound: preset.locationFound,
        pickupDesk: PICKUP_DESKS[0],
        aiTags: [...preset.aiTags],
        proofQuestion: preset.proofQuestion,
      });
      setIsAnalyzing(false);
    }, 350);
  };

  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    setIntakeSuccessNotice(null);
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl =
        typeof reader.result === 'string'
          ? reader.result
          : INTAKE_PRESETS[0].imageUrl;
      const lowerName = file.name.toLowerCase();
      const inferredTags = lowerName.includes('laptop')
        ? ['Electronics', 'Blue', 'Scratched', 'Dell']
        : lowerName.includes('bottle') || lowerName.includes('flask')
          ? ['Drinkware', 'Black', 'Insulated', 'Stickers']
          : ['Personal Item', 'Campus Intake', 'Blue', 'Verified'];

      window.setTimeout(() => {
        setDraftIntake({
          imageUrl: resultUrl,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ') || 'Found Campus Item',
          category: 'Electronics',
          locationFound: CAMPUS_LOCATIONS[0],
          pickupDesk: PICKUP_DESKS[0],
          aiTags: inferredTags,
          proofQuestion:
            'Describe a unique mark, sticker, serial prefix, or internal detail to verify ownership.',
        });
        setIsAnalyzing(false);
      }, 400);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleAddTag = () => {
    if (!draftIntake) return;
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!draftIntake.aiTags.includes(trimmed)) {
      setDraftIntake({
        ...draftIntake,
        aiTags: [...draftIntake.aiTags, trimmed],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!draftIntake) return;
    setDraftIntake({
      ...draftIntake,
      aiTags: draftIntake.aiTags.filter((t) => t !== tagToRemove),
    });
  };

  const handlePublishItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftIntake || !draftIntake.title.trim()) return;
    onAddFoundItem({
      title: draftIntake.title.trim(),
      category: draftIntake.category,
      imageUrl: draftIntake.imageUrl,
      locationFound: draftIntake.locationFound,
      pickupDesk: draftIntake.pickupDesk,
      aiTags: draftIntake.aiTags,
      proofQuestion: draftIntake.proofQuestion.trim(),
    });
    const publishedTitle = draftIntake.title.trim();
    setDraftIntake(null);
    setIntakeSuccessNotice(
      `"${publishedTitle}" logged to Found (Unclaimed) and published to the Student Portal.`,
    );
    if (activeSection === 'intake') {
      setActiveSection('dashboard');
    }
  };

  const handleOpenResolution = (item: FoundItem) => {
    setSelectedPendingItem(item);
    setStudentIdInput('');
    setCustodyError('');
  };

  const handleApproveAndReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendingItem) return;
    const cleaned = studentIdInput.trim().toUpperCase();
    if (cleaned.length < 5) {
      setCustodyError(
        'Enter a valid Student ID Number (at least 5 characters) for the custody log.',
      );
      return;
    }
    onApproveReturn(selectedPendingItem.id, cleaned);
    setSelectedPendingItem(null);
    setStudentIdInput('');
    setCustodyError('');
  };

  const navItems: {
    id: AdminSection;
    label: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Add New Item', icon: PlusCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sectionTitle =
    activeSection === 'dashboard'
      ? 'Inventory & Claims Board'
      : activeSection === 'intake'
        ? 'Add New Found Item'
        : 'Campus Desk Settings';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-slate-200 shrink-0">
        <div className="h-16 px-5 border-b border-slate-200 flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-display font-bold text-sm tracking-tight">
            CM
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-slate-900 truncate">
              CampusMatch
            </p>
            <p className="text-xs text-slate-500 truncate">Facilities Staff</p>
          </div>
        </div>

        <nav
          aria-label="Admin sidebar navigation"
          className="flex-1 p-3 space-y-1"
        >
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const active = activeSection === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveSection(nav.id)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                  active
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{nav.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onSwitchToStudent}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-900 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Student Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onSwitchToStudent}
              className="lg:hidden min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Student View</span>
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-500 whitespace-nowrap">
                CampusMatch Admin
              </span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <h1 className="font-display font-semibold text-slate-900 truncate">
                {sectionTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeSection === 'dashboard' && (
              <div className="relative hidden md:block w-64">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter items, tags, IDs..."
                  aria-label="Filter inventory board"
                  className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-900"
                />
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-blue-900 text-white text-xs font-semibold flex items-center justify-center">
                MR
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  Officer M. Rivera
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Union Desk A
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile/Tablet Sub-Navigation Tabs */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const active = activeSection === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveSection(nav.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>

        {/* Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {intakeSuccessNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{intakeSuccessNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setIntakeSuccessNotice(null)}
                aria-label="Dismiss notification"
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Quick Intake & AI Preview (Shown on Dashboard & Add New Item) */}
          {(activeSection === 'dashboard' || activeSection === 'intake') && (
            <section
              aria-label="Quick photo intake and AI metadata preview"
              className="grid grid-cols-1 xl:grid-cols-12 gap-5"
            >
              {/* Quick Intake Dropzone */}
              <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="font-display text-base font-semibold text-slate-900">
                      Quick Intake Widget
                    </h2>
                    <span className="text-xs font-medium text-slate-500">
                      Gemini 1.5 Flash
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 ${
                      isDragging
                        ? 'border-blue-900 bg-blue-50/70'
                        : 'border-slate-300 bg-slate-50/70 hover:border-blue-900/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="h-11 w-11 rounded-xl bg-blue-900/10 text-blue-900 mx-auto flex items-center justify-center mb-3">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      Upload Photo of Found Item
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag and drop an intake photo here, or click to browse
                      files
                    </p>
                  </div>
                </div>

                {/* Instant Sample Triggers */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Test AI tag extraction with a sample photo:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {INTAKE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => runMockGeminiExtraction(preset)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-900/40 hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Preview Widget */}
              <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-center">
                {isAnalyzing ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="h-10 w-10 rounded-full bg-blue-900/10 text-blue-900 mx-auto flex items-center justify-center animate-spin">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      Analyzing photo with Gemini 1.5 Flash...
                    </p>
                    <p className="text-xs text-slate-500">
                      Extracting category, color, wear markers, and ownership
                      prompt
                    </p>
                  </div>
                ) : draftIntake ? (
                  <form onSubmit={handlePublishItem} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-900" />
                        <h2 className="font-display text-base font-semibold text-slate-900">
                          Gemini AI Metadata Preview
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDraftIntake(null)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        Clear draft
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <ItemPhoto
                          src={draftIntake.imageUrl}
                          alt={draftIntake.title}
                          className="h-full w-full"
                        />
                      </div>

                      <div className="sm:col-span-8 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="draft-title"
                              className="block text-xs font-medium text-slate-600 mb-1"
                            >
                              Generic Title
                            </label>
                            <input
                              id="draft-title"
                              type="text"
                              value={draftIntake.title}
                              onChange={(e) =>
                                setDraftIntake({
                                  ...draftIntake,
                                  title: e.target.value,
                                })
                              }
                              className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-900"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="draft-location"
                              className="block text-xs font-medium text-slate-600 mb-1"
                            >
                              Location Found
                            </label>
                            <select
                              id="draft-location"
                              value={draftIntake.locationFound}
                              onChange={(e) =>
                                setDraftIntake({
                                  ...draftIntake,
                                  locationFound: e.target.value,
                                })
                              }
                              className="w-full h-9 px-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-900"
                            >
                              {CAMPUS_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Extracted AI Tags as Interactive UI Pills */}
                        <div>
                          <span className="block text-xs font-medium text-slate-600 mb-1.5">
                            Extracted AI Tags
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {draftIntake.aiTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  aria-label={`Remove tag ${tag}`}
                                  className="text-blue-700 hover:text-blue-950"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="text"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                  }
                                }}
                                placeholder="+ Add tag"
                                aria-label="Add custom AI tag"
                                className="w-24 h-7 px-2 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-900"
                              />
                              {newTagInput.trim() && (
                                <button
                                  type="button"
                                  onClick={handleAddTag}
                                  aria-label="Confirm add tag"
                                  className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Verification prompt: “{draftIntake.proofQuestion}”
                      </p>
                      <button
                        type="submit"
                        className="min-h-[42px] px-5 py-2 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        Publish to Found Inventory
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-base font-semibold text-slate-900">
                      AI Preview Widget
                    </h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Upload a photo or select a sample on the left to inspect
                      extracted Gemini AI tags such as{' '}
                      <span className="font-medium text-slate-700">
                        Electronics, Blue, Scratched, Dell
                      </span>{' '}
                      before publishing to students.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Kanban Dashboard */}
          {activeSection === 'dashboard' && (
            <section aria-label="Inventory Kanban board" className="space-y-4">
              {/* Summary Bar */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5">
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-slate-600">
                    Found (Unclaimed)
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-semibold text-slate-900 tabular-nums">
                    {foundColumn.length}
                  </span>
                </div>
                <div className="bg-white border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-amber-800">
                    Claim Pending
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-semibold text-amber-800 tabular-nums">
                    {pendingColumn.length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-slate-600">
                    Returned
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-semibold text-emerald-700 tabular-nums">
                    {returnedColumn.length}
                  </span>
                </div>
              </div>

              {/* 3-Column Kanban Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {/* Column 1: Found (Unclaimed) */}
                <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="px-1 flex items-center justify-between">
                    <h2 className="font-display text-sm font-semibold text-slate-900">
                      Found (Unclaimed)
                    </h2>
                    <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                      {foundColumn.length}
                    </span>
                  </div>

                  {foundColumn.length === 0 ? (
                    <div className="bg-white/70 border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                      No unclaimed items match your filter.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {foundColumn.map((item) => (
                        <article
                          key={item.id}
                          className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors space-y-3"
                        >
                          <div className="flex gap-3">
                            <div className="h-16 w-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <ItemPhoto
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-full w-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                                  {item.id}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {item.foundRelativeTime}
                                </span>
                              </div>
                              <h3 className="font-display text-sm font-semibold text-slate-900 truncate mt-0.5">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {item.locationFound.split(' — ')[0]}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {item.aiTags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: Claim Pending */}
                <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-3.5 space-y-3">
                  <div className="px-1 flex items-center justify-between">
                    <h2 className="font-display text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-700" />
                      <span>Claim Pending</span>
                    </h2>
                    <span className="font-mono text-xs font-semibold text-amber-800 tabular-nums">
                      {pendingColumn.length}
                    </span>
                  </div>

                  {pendingColumn.length === 0 ? (
                    <div className="bg-white/70 border border-dashed border-amber-300 rounded-xl p-6 text-center text-xs text-slate-500">
                      No claims awaiting verification.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingColumn.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleOpenResolution(item)}
                          className="w-full text-left bg-white border border-amber-300 rounded-xl p-3.5 hover:border-blue-900 hover:shadow-sm transition-all space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                              <Clock className="h-3 w-3" />
                              <span>Claim Pending</span>
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                              {item.claim?.claimRef}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <div className="h-14 w-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <ItemPhoto
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-full w-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-sm font-semibold text-slate-900 truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5 truncate">
                                Claimant: {item.claim?.claimantName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {item.claim?.submittedAt}
                              </p>
                            </div>
                          </div>

                          {item.claim?.proofAnswer && (
                            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 line-clamp-2 border border-slate-100">
                              “{item.claim.proofAnswer}”
                            </p>
                          )}

                          <div className="pt-1 flex items-center justify-between text-xs font-semibold text-blue-900">
                            <span>Inspect proof &amp; resolve</span>
                            <span>→</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 3: Returned */}
                <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="px-1 flex items-center justify-between">
                    <h2 className="font-display text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      <span>Returned</span>
                    </h2>
                    <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                      {returnedColumn.length}
                    </span>
                  </div>

                  {returnedColumn.length === 0 ? (
                    <div className="bg-white/70 border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                      Returned items will appear here once released.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {returnedColumn.map((item) => (
                        <article
                          key={item.id}
                          className="bg-white/80 border border-slate-200 rounded-xl p-3.5 opacity-75 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Returned</span>
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                              {item.custodyLog?.studentIdNumber}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <div className="h-14 w-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 grayscale-[35%]">
                              <ItemPhoto
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-full w-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-sm font-semibold text-slate-800 truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 truncate">
                                Released to {item.claim?.claimantName}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                                {item.custodyLog?.returnedAt}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Settings View */}
          {activeSection === 'settings' && (
            <section
              aria-label="Campus desk settings"
              className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 space-y-6"
            >
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Intake &amp; Custody Preferences
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Configure University SSO verification, retention timelines,
                  and automated student match notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="sso-domain"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Authorized University SSO Domain
                  </label>
                  <input
                    id="sso-domain"
                    type="text"
                    value={ssoDomain}
                    onChange={(e) => {
                      setSsoDomain(e.target.value);
                      setSettingsSaved(false);
                    }}
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="retention-days"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Unclaimed Item Retention Window
                  </label>
                  <select
                    id="retention-days"
                    value={retentionDays}
                    onChange={(e) => {
                      setRetentionDays(e.target.value);
                      setSettingsSaved(false);
                    }}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-900"
                  >
                    <option value="30">30 days before donation / archive</option>
                    <option value="60">60 days before donation / archive</option>
                    <option value="90">90 days (Full Semester)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Automated Match Email Alerts
                    </p>
                    <p className="text-xs text-slate-500">
                      Email subscribed students when Gemini AI tags match a
                      saved query.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoEmailMatches}
                    onClick={() => {
                      setAutoEmailMatches((prev) => !prev);
                      setSettingsSaved(false);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      autoEmailMatches ? 'bg-blue-900' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        autoEmailMatches ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                {settingsSaved ? (
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Preferences saved for CampusMatch Desk</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Changes apply across all pickup desks
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSettingsSaved(true)}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Resolution Modal for Claim Pending Cards */}
      {selectedPendingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-modal-title"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="resolution-modal-title"
                    className="font-display text-lg font-semibold text-slate-900"
                  >
                    Resolve Ownership Claim
                  </h2>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {selectedPendingItem.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Claim Ref {selectedPendingItem.claim?.claimRef} · Submitted{' '}
                  {selectedPendingItem.claim?.submittedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPendingItem(null)}
                aria-label="Close resolution modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Side-by-side staff photo vs student proof */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                <div className="sm:col-span-5 space-y-2.5">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <ItemPhoto
                      src={selectedPendingItem.imageUrl}
                      alt={selectedPendingItem.title}
                      className="h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-slate-900">
                      {selectedPendingItem.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPendingItem.locationFound}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPendingItem.aiTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Claimant (University SSO)
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedPendingItem.claim?.claimantName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {selectedPendingItem.claim?.claimantEmail}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-500">
                      Verification Question Asked
                    </p>
                    <p className="text-xs text-slate-700">
                      {selectedPendingItem.proofQuestion}
                    </p>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-amber-900">
                      Student’s Proof of Ownership Answer
                    </p>
                    <p className="text-sm text-slate-900 leading-relaxed">
                      “{selectedPendingItem.claim?.proofAnswer}”
                    </p>
                  </div>
                </div>
              </div>

              {/* Chain of Custody Log Form */}
              <form
                onSubmit={handleApproveAndReturn}
                className="pt-4 border-t border-slate-200 space-y-4"
              >
                <div>
                  <label
                    htmlFor="custody-student-id"
                    className="block text-sm font-semibold text-slate-900 mb-1.5"
                  >
                    Student ID Number (Chain of Custody Log)
                  </label>
                  <input
                    id="custody-student-id"
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => {
                      setStudentIdInput(e.target.value);
                      if (custodyError) setCustodyError('');
                    }}
                    placeholder="e.g., SID-2026-4918"
                    className="w-full h-11 px-3.5 font-mono text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                  />
                  {custodyError && (
                    <p className="text-xs font-medium text-red-600 mt-1.5">
                      {custodyError}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onRejectClaim(selectedPendingItem.id);
                      setSelectedPendingItem(null);
                    }}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Reject Claim (Return to Found)
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
                  >
                    Approve &amp; Return
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
