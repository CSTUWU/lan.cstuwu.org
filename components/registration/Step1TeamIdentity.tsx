import React from 'react';
import Image from 'next/image';
import { GraduationCap, Mail, Phone, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { UWU_DEGREE_PROGRAMMES } from '@/lib/types';
import { getDegreeCodeFromName } from '@/lib/degreeUtils';

export interface Step1FormData {
  teamName: string;
  teamTag: string;
  logo: string;
  logoPreview: string;
  logoFile: File | null;
  degreeProgram: string;
  email: string;
  whatsappNumber: string;
}

interface Step1TeamIdentityProps {
  form: Step1FormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<Step1FormData>) => void;
  onLogoFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Step1TeamIdentity({
  form,
  errors,
  onChange,
  onLogoFileSelect,
}: Step1TeamIdentityProps) {
  const isEmailValid = Boolean(form.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
  const isWhatsappValid = Boolean(form.whatsappNumber.length === 10 && form.whatsappNumber.startsWith('0'));
  const isTeamTagValid = Boolean(form.teamTag.trim().length >= 2 && form.teamTag.trim().length <= 10);
  const isTeamNameValid = Boolean(form.teamName.trim().length >= 2);

  return (
    <div className="space-y-6">
      <div className="border-b border-gunmetal pb-4 mb-6">
        <h3 className="font-display font-black text-xl text-tacticalWhite uppercase tracking-wider">
          STEP 1: SQUAD DETAILS &amp; ACADEMIC PROFILE
        </h3>
        <p className="text-xs font-mono text-mutedKhaki mt-1">
          Provide team information, email, degree program, and contact details. All 5 squad members share this single Degree Programme. Individual member years (1–4) will be selected in Step 2.
        </p>
      </div>

      {/* Team Name and Team Tag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2">
            TEAM NAME <span className="text-sand">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Shadow Recon"
            value={form.teamName}
            onChange={(e) => {
              const name = e.target.value;
              const suggestedTag = form.teamTag || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
              onChange({
                teamName: name,
                teamTag: form.teamTag ? form.teamTag : suggestedTag,
              });
            }}
            className={`w-full bg-surface border px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
              errors.teamName
                ? 'border-rose-500'
                : isTeamNameValid
                ? 'border-emerald-500/70 focus:border-emerald-400'
                : 'border-gunmetal focus:border-olive'
            }`}
          />
          {errors.teamName ? (
            <p className="text-[11px] font-mono text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.teamName}</span>
            </p>
          ) : isTeamNameValid ? (
            <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Team name valid</span>
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2">
            TEAM TAG (2–10 CHARACTERS) <span className="text-sand">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. CST.SR"
            maxLength={10}
            value={form.teamTag}
            onChange={(e) => onChange({ teamTag: e.target.value.toUpperCase() })}
            className={`w-full bg-surface border px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none uppercase transition-colors ${
              errors.teamTag
                ? 'border-rose-500'
                : isTeamTagValid
                ? 'border-emerald-500/70 focus:border-emerald-400'
                : 'border-gunmetal focus:border-olive'
            }`}
          />
          {errors.teamTag ? (
            <p className="text-[11px] font-mono text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.teamTag}</span>
            </p>
          ) : isTeamTagValid ? (
            <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Tag valid ({form.teamTag.trim().length}/10)</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Degree Programme Dropdown (Shared once by all 5 members) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-mutedKhaki uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-sand" />
            <span>DEGREE PROGRAMME (UVA WELLASSA UNIVERSITY) <span className="text-sand">*</span></span>
          </label>
          {(() => {
            const code = getDegreeCodeFromName(form.degreeProgram);
            return code ? (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-surface border border-gunmetal text-sand font-bold">
                DEGREE CODE: {code}
              </span>
            ) : null;
          })()}
        </div>
        <select
          value={form.degreeProgram}
          onChange={(e) => onChange({ degreeProgram: e.target.value })}
          className={`w-full bg-surface border px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
            errors.degreeProgram ? 'border-rose-500' : 'border-gunmetal focus:border-olive'
          }`}
        >
          {UWU_DEGREE_PROGRAMMES.map((deg) => (
            <option key={deg} value={deg} className="bg-military-black text-tacticalWhite">
              {deg}
            </option>
          ))}
        </select>
        {errors.degreeProgram && (
          <p className="text-[11px] font-mono text-rose-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.degreeProgram}</span>
          </p>
        )}
        <p className="text-[10px] font-mono text-mutedKhaki mt-1">
          Every squad member must be enrolled in this same degree programme. Verified from individual enrolment numbers (e.g. <span className="text-sand font-bold">UWU/{getDegreeCodeFromName(form.degreeProgram) || 'CST'}/...</span>).
        </p>
      </div>

      {/* Email Address & WhatsApp Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-sand" />
            <span>EMAIL ADDRESS <span className="text-sand">*</span></span>
          </label>
          <input
            type="email"
            placeholder="e.g. leader@std.uwu.ac.lk"
            value={form.email}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ email: val });
            }}
            className={`w-full bg-surface border px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
              errors.email
                ? 'border-rose-500'
                : isEmailValid
                ? 'border-emerald-500/70 focus:border-emerald-400'
                : 'border-gunmetal focus:border-olive'
            }`}
          />
          {errors.email ? (
            <p className="text-[11px] font-mono text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          ) : isEmailValid ? (
            <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Valid email format</span>
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>WHATSAPP NUMBER <span className="text-sand">*</span></span>
          </label>
          <input
            type="tel"
            maxLength={10}
            placeholder="e.g. 0771234567"
            value={form.whatsappNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              onChange({ whatsappNumber: val });
            }}
            className={`w-full bg-surface border px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
              errors.whatsappNumber
                ? 'border-rose-500'
                : isWhatsappValid
                ? 'border-emerald-500/70 focus:border-emerald-400'
                : 'border-gunmetal focus:border-olive'
            }`}
          />
          {errors.whatsappNumber ? (
            <p className="text-[11px] font-mono text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.whatsappNumber}</span>
            </p>
          ) : form.whatsappNumber.length > 0 && !form.whatsappNumber.startsWith('0') ? (
            <p className="text-[11px] font-mono text-rose-500 mt-1 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Must start with 0 (e.g. 0771234567)</span>
            </p>
          ) : form.whatsappNumber.length > 0 && form.whatsappNumber.length < 10 ? (
            <p className="text-[11px] font-mono text-amber-400 mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>
                Enter {10 - form.whatsappNumber.length} more digit{10 - form.whatsappNumber.length > 1 ? 's' : ''} (10 digits starting with 0)
              </span>
            </p>
          ) : isWhatsappValid ? (
            <p className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Valid 10-digit WhatsApp number</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Team Logo */}
      <div className="pt-2">
        <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2">
          TEAM LOGO (FILE UPLOAD OR URL)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-surface/50 border border-gunmetal">
          <div className="relative w-20 h-20 bg-surface border border-gunmetal shrink-0 overflow-hidden">
            <Image
              src={form.logoPreview}
              alt="Logo Preview"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-olive hover:bg-olive-light text-black font-display font-black text-xs uppercase tracking-wider transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>CHOOSE LOGO FILE</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={onLogoFileSelect}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] font-mono text-mutedKhaki self-center">
                {form.logoFile ? form.logoFile.name : 'PNG, JPG, WEBP (MAX 2MB)'}
              </span>
            </div>
            <div>
              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)"
                value={form.logoFile ? '' : (form.logo.startsWith('data:') ? '' : form.logo)}
                disabled={Boolean(form.logoFile)}
                onChange={(e) => {
                  const url = e.target.value;
                  onChange({
                    logo: url,
                    logoPreview: url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                  });
                }}
                className="w-full bg-surface border border-gunmetal px-3 py-1.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

