'use client';

// Explore Bharat Safar — Section 2: Artisan Showcase & Traditional Crafts
// Reference: EBS-BLU-42-VKS Section 2.1 & 9, EBS-DOC-52 Section 52.2
import * as React from 'react';
import type {
  FolkArtisanCraft,
  VillageBusinessEntity,
  MasterArtisanInfo,
  ArtisanProfileEntity,
} from '@ebs/types';

interface ArtisanShowcaseProps {
  crafts: FolkArtisanCraft[];
  workshops?: VillageBusinessEntity[];
  artisans?: ArtisanProfileEntity[];
}

export function ArtisanShowcase({ crafts, workshops = [], artisans = [] }: ArtisanShowcaseProps) {
  const [selectedCraft, setSelectedCraft] = React.useState<FolkArtisanCraft | null>(null);
  const [selectedMasterArtisan, setSelectedMasterArtisan] = React.useState<{
    artisan: MasterArtisanInfo;
    craftName: string;
    hasGiTag: boolean;
  } | null>(null);
  const [selectedArtisanProfile, setSelectedArtisanProfile] =
    React.useState<ArtisanProfileEntity | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const craftWorkshops = workshops.filter(w => w.category === 'CRAFT');

  const filteredCrafts =
    selectedCategory === 'ALL' ? crafts : crafts.filter(c => c.craftType === selectedCategory);

  const categories = ['ALL', 'PAINTING', 'WOODCRAFT', 'POTTERY', 'HANDLOOM', 'METAL'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎨</span> Indigenous Artisans & Handlooms Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Empowering rural master weavers, sculptors, and folk artists with direct digital
            visibility, GI tag provenance, and zero intermediary exploitation.
          </p>
        </div>

        {/* Category Filters */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 self-start overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Traditions' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crafts & Master Artisans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredCrafts.map((craft, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  {craft.craftType}
                </span>
                {craft.hasGiTag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <span>🎖️</span> GI Tagged{' '}
                    {craft.giTagRegistrationNumber ? `(${craft.giTagRegistrationNumber})` : ''}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {craft.craftName}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {craft.description}
                </p>
                {craft.heritageStory && (
                  <p className="text-[11px] text-amber-900 dark:text-amber-300/80 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30 mt-2.5 font-serif italic">
                    &ldquo;{craft.heritageStory}&rdquo;
                  </p>
                )}
              </div>

              {/* Master Artisans Roster */}
              {craft.masterArtisans && craft.masterArtisans.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Master Craftsmen & Gurus
                  </span>
                  {craft.masterArtisans.map((ma, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ma.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                            Master ({ma.experienceYears}y exp)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {ma.specialization} &bull; {ma.recognition || 'Generational Guru'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMasterArtisan({
                            artisan: ma,
                            craftName: craft.craftName,
                            hasGiTag: craft.hasGiTag,
                          })
                        }
                        className="text-[11px] font-bold text-bharat-evergreen-700 dark:text-bharat-evergreen-400 hover:underline px-2 py-1"
                      >
                        Profile &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Practicing Families:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {craft.primaryPractitionersCount ?? 'Generational Guild'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                <span className="block mb-1">Authentic Raw Materials:</span>
                <div className="flex flex-wrap gap-1">
                  {craft.rawMaterials.map((mat, mIdx) => (
                    <span
                      key={mIdx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCraft(craft)}
                className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition text-center"
              >
                Inquire & Support Collective
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Craft Workshops */}
      {craftWorkshops.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Registered Village Craft Guilds & Heritage Workshops
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {craftWorkshops.map(w => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between"
              >
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                    {w.businessName}
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lead Artisan: <strong>{w.contactPerson}</strong> &bull; {w.addressDescription}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                    Direct Contact: {w.contactPhone}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  Verified Guild
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registered Master Artisans & Craftspersons Directory */}
      {artisans.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>🏺</span> Registered Master Artisans & Craftspersons Directory
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {artisans.length} Artisans Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artisans.map(art => (
              <div
                key={art.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      {art.craftCategory}
                    </span>
                    {art.hasGiTag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        GI Protected
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="text-base font-bold text-slate-900 dark:text-white">
                      {art.artisanName}
                    </h5>
                    <p className="text-xs font-semibold text-bharat-evergreen-700 dark:text-bharat-evergreen-400 mt-0.5">
                      {art.craftTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{art.yearsOfExperience} yrs experience</span>
                      {art.isMasterArtisan && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            Master Artisan
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {art.bio}
                  </p>

                  <div className="text-[11px] text-slate-500">📍 {art.workshopAddress}</div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    DPDP Line: <strong>{art.contactPhone}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedArtisanProfile(art)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition text-center"
                  >
                    View Full Profile & Credentials &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artisan Profile Modal */}
      {selectedArtisanProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎖️</span>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedArtisanProfile.artisanName}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {selectedArtisanProfile.craftTitle} &bull;{' '}
                    {selectedArtisanProfile.craftCategory}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArtisanProfile(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedArtisanProfile.bio}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Experience:</span>
                  <span className="font-bold">
                    {selectedArtisanProfile.yearsOfExperience} Years of Heritage Crafting
                  </span>
                </div>
                {selectedArtisanProfile.recognitionAwards &&
                  selectedArtisanProfile.recognitionAwards.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Awards & Honors:</span>
                      <span className="font-semibold text-purple-700 dark:text-purple-300">
                        {selectedArtisanProfile.recognitionAwards.join(', ')}
                      </span>
                    </div>
                  )}
                {selectedArtisanProfile.hasGiTag && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">GI Registration:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {selectedArtisanProfile.giTagRegistrationNumber || 'Verified GI Tag'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Workshop Location:</span>
                  <span>{selectedArtisanProfile.workshopAddress}</span>
                </div>
              </div>

              {selectedArtisanProfile.specialties &&
                selectedArtisanProfile.specialties.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Specialized Motifs & Works:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedArtisanProfile.specialties.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedArtisanProfile.rawMaterials &&
                selectedArtisanProfile.rawMaterials.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Indigenous Raw Materials:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedArtisanProfile.rawMaterials.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold block">DPDP Act 2023 Direct Communication Channel:</span>
                <div className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 pt-0.5">
                  {selectedArtisanProfile.contactPhone}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedArtisanProfile(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-bharat-evergreen-700 hover:bg-bharat-evergreen-800 text-white transition"
            >
              Close Artisan Profile
            </button>
          </div>
        </div>
      )}

      {/* Master Artisan Detail Modal */}
      {selectedMasterArtisan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎖️</span>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedMasterArtisan.artisan.name}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Master Artisan &bull; {selectedMasterArtisan.craftName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMasterArtisan(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Experience:</span>
                  <span className="font-bold">
                    {selectedMasterArtisan.artisan.experienceYears} Years of Ancestral Mastery
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recognition:</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    {selectedMasterArtisan.artisan.recognition || 'Elected Village Guild Master'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization:</span>
                  <span className="font-semibold">
                    {selectedMasterArtisan.artisan.specialization}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Workshop Guild:</span>
                  <span>
                    {selectedMasterArtisan.artisan.workshopName || 'Gaothan Artisan Collective'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GI Tag Protection:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedMasterArtisan.hasGiTag
                      ? '✓ Authentic Registered GI'
                      : 'Indigenous Heritage'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold block">DPDP Act 2023 Direct Communication Channel:</span>
                <p className="text-[11px] leading-relaxed">
                  Call or visit during community workshop hours. Intermediary commissions are
                  strictly barred by platform charter.
                </p>
                <div className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 pt-1">
                  {selectedMasterArtisan.artisan.contactPhone || '+91-20-XXXX-7734 (Masked Proxy)'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMasterArtisan(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-bharat-evergreen-700 hover:bg-bharat-evergreen-800 text-white transition"
            >
              Close Master Profile
            </button>
          </div>
        </div>
      )}

      {/* Inquiry Dialog Modal */}
      {selectedCraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Support {selectedCraft.craftName}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedCraft(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore Bharat Safar connects conscious travellers and heritage buyers directly to
              Gram Panchayat-registered artisanal collectives with zero commissions.
            </p>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="font-semibold">DPDP Act 2023 Protected Proxy Channel:</div>
              <div>Official Desk: Gramin Mahila Hastakala Sahakari Sanstha</div>
              <div className="font-mono">
                Helpline: +91-20-XXXX-9912 (Connecting you via Cloud PBX)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCraft(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-bharat-evergreen-700 hover:bg-bharat-evergreen-800 text-white transition"
            >
              Close Inquiry Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
