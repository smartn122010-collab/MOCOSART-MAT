import React from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { CompanyInfo, Founder, GrowthMetric, DEFAULT_GROWTH_METRICS } from '../types';

interface HomeScreenProps {
  companyInfo: CompanyInfo;
  founders: Founder[];
  growthMetrics?: GrowthMetric[];
  onGetStarted: () => void;
  onExploreCourses: () => void;
  onOpenPolicy?: (type: 'terms' | 'privacy' | 'refund') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  companyInfo,
  founders,
  growthMetrics = [],
  onGetStarted,
  onExploreCourses,
  onOpenPolicy
}) => {
  // Dynamic growth metrics list configured by Admin
  const activeGrowthMetrics = growthMetrics && growthMetrics.length > 0 ? growthMetrics : DEFAULT_GROWTH_METRICS;
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-14 space-y-12">
      {/* Center of Company Name and Description */}
      <section className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel-green border border-emerald-300/60 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Premier Learning & Examination Institute</span>
        </div>

        {/* Company Name in Center */}
        <h1 
          id="home-company-title"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-serif"
        >
          {companyInfo.companyName}
        </h1>

        {/* Description under Company Name */}
        <p 
          id="home-company-description"
          className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl mx-auto"
        >
          {companyInfo.description}
        </p>
      </section>

      {/* Founders Section (Under company name & description) */}
      <section id="home-founders-section" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            Founders & Leadership
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Visionary academics guiding curriculum depth, testing rigor, and industry accreditation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {founders.map((founder) => (
            <div 
              key={founder.id} 
              className="rounded-2xl glass-panel p-6 border border-white/80 shadow-lg flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left transition-all hover:shadow-xl hover:border-emerald-300/60"
            >
              <div className="relative shrink-0">
                <img
                  src={founder.photoUrl}
                  alt={founder.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-lg shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {founder.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    {founder.title}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {founder.description}
                </p>

                {founder.socialLink && (
                  <a
                    href={founder.socialLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline pt-1"
                  >
                    <span>Connect Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Under Founders: Containers for Growth Management metrics (Manually configured, edited, or removed by Admin via Growth Management) */}
      <section id="home-stat-containers" className="space-y-8">
        {activeGrowthMetrics.length > 0 && (
          <div className={`grid grid-cols-1 ${
            activeGrowthMetrics.length === 1 ? 'sm:grid-cols-1 max-w-sm' :
            activeGrowthMetrics.length === 2 ? 'sm:grid-cols-2 max-w-2xl' :
            'sm:grid-cols-3 max-w-4xl'
          } gap-4 md:gap-6 mx-auto`}>
            {activeGrowthMetrics.map((stat) => (
              <div 
                key={stat.id}
                id={`stat-${stat.id}`}
                className="rounded-2xl glass-panel p-6 text-center border border-white/90 shadow-md hover:border-emerald-300 transition-all flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center mb-1 shadow-inner">
                  {stat.category === 'learning' ? (
                    <Users className="w-6 h-6" />
                  ) : stat.category === 'certificate' ? (
                    <Award className="w-6 h-6" />
                  ) : stat.category === 'percentage' ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : (
                    <GraduationCap className="w-6 h-6" />
                  )}
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {stat.title}
                </span>
                <p className="text-[11px] text-slate-500">
                  {stat.subtitle}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* And under the button in get start */}
        <div className="text-center pt-2">
          <button
            id="home-get-started-btn"
            onClick={onGetStarted}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-semibold text-base sm:text-lg shadow-xl shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer group"
          >
            <span>Get Started with Mocosart</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-slate-500 mt-2.5">
            Google Sign-in • Instant Student Dashboard • Course Enrollment
          </p>
        </div>

        {/* Official Legal & Policies (User click to read) */}
        {onOpenPolicy && (
          <div className="pt-8 border-t border-slate-200/80">
            <div className="text-center max-w-xl mx-auto mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Official Institutional Disclosures
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Click any policy below to read full regulatory conditions, certification standards, and refund guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                className="p-3.5 rounded-xl glass-panel border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Terms & Conditions
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Rules on course access, student conduct, and verified accreditation.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="p-3.5 rounded-xl glass-panel border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Privacy Policy
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Encrypted credential handling and student profile confidentiality.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPolicy('refund')}
                className="p-3.5 rounded-xl glass-panel border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Refund Conditions
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  48-hour exam cancellation window and credit turnaround timelines.
                </p>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
