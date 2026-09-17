import React from 'react';
import { HeartPulse, CheckCircle2, AlertCircle, FileSpreadsheet, ShieldCheck, User } from 'lucide-react';
import { PatientProfile, GameSessionResult, LanguageCode } from '../../types';

interface HealthcareDashboardProps {
  patient: PatientProfile;
  sessions: GameSessionResult[];
  lang: LanguageCode;
}

export const HealthcareDashboard: React.FC<HealthcareDashboardProps> = ({
  patient,
  sessions,
  lang,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-teal-950 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-900 text-teal-200 text-xs font-semibold uppercase tracking-wider">
              Health Worker & Community Auxiliary View
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
              Community Cognitive Adherence Monitoring
            </h2>
            <p className="text-teal-200/80 text-sm leading-relaxed">
              Longitudinal activity adherence, routine compliance, and observed baseline variance for North-Eastern Region outreach.
            </p>
          </div>

          <div className="bg-teal-900/80 border border-teal-800 p-4 rounded-2xl flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="text-teal-300 font-semibold uppercase block">Assigned District</span>
              <p className="font-bold text-white text-sm">Kamrup Rural, Assam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Patient Overview Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-800 text-amber-300 font-bold flex items-center justify-center text-lg">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">{patient.fullName}</h3>
              <p className="text-xs text-stone-500">Age: {patient.age} • {patient.region} • Caregiver: {patient.caregiverName}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
            Routine Adherence: 95%
          </span>
        </div>

        {/* Observed Baseline Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 block uppercase font-semibold">Active Days Baseline</span>
            <p className="text-xl font-bold text-teal-900 mt-1">{patient.dailyStreak} Consecutive Days</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Zero missed sessions this week</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 block uppercase font-semibold">Response Time Stability</span>
            <p className="text-xl font-bold text-teal-900 mt-1">3.4s Average</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Consistent across recall exercises</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 block uppercase font-semibold">Offline Operation</span>
            <p className="text-xl font-bold text-emerald-800 mt-1">100% Synced</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Local cache active for low-bandwidth zones</p>
          </div>
        </div>

        {/* Clinical Guardrail Statement (TRD Section 21 & 54) */}
        <div className="rounded-2xl bg-stone-100 p-5 border border-stone-200 text-stone-700 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-stone-900">Clinical Responsibility Boundary</p>
            <p className="mt-0.5 leading-relaxed">
              CognitiveSaathi provides structured cognitive engagement and routine memory assistance. These observational metrics must never be displayed as diagnostic probabilities or substitute for formal MMSE/MoCA neurological examinations by a medical officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
