import React from 'react';
import { Upload, FileCode2, Trash2, CheckCircle2, XCircle, AlertCircle, GraduationCap } from 'lucide-react';
import { ACADEMIC_YEARS } from '@/lib/types';
import { getDegreeCodeFromName, extractDegreeFromEnrollment, validateStrictEnrollmentFormat } from '@/lib/degreeUtils';

export interface MemberFormState {
  fullName: string;
  gamingName: string;
  year: string;
  enrollmentNumber: string;
  configFile?: File | null;
  configFileName?: string;
}

interface Step2MemberRosterProps {
  members: MemberFormState[];
  degreeProgram: string;
  errors: Record<string, string>;
  onMemberChange: (index: number, field: keyof MemberFormState, value: string) => void;
  onMemberConfigFile: (index: number, file: File | null) => void;
}

export default function Step2MemberRoster({
  members,
  degreeProgram,
  errors,
  onMemberChange,
  onMemberConfigFile,
}: Step2MemberRosterProps) {
  const degreeCode = getDegreeCodeFromName(degreeProgram);

  return (
    <div className="space-y-6">
      <div className="border-b border-gunmetal pb-4 mb-6">
        <h3 className="font-display font-black text-xl text-tacticalWhite uppercase tracking-wider">
          STEP 2: 5 OPERATIVE ROSTER &amp; ACADEMIC IDENTIFICATION
        </h3>
        <p className="text-xs font-mono text-mutedKhaki mt-1">
          Register all 5 squad operatives. Member 1 serves as Team Leader. Enter each operative&apos;s individual Academic Year (Year 1 to 4) and unique UWU Enrollment Number.
        </p>
      </div>

      {/* Cohort Eligibility Notice Banner */}
      <div className="bg-sand/10 border border-sand/30 p-4 flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-sand shrink-0 mt-0.5" />
        <div className="space-y-1 font-mono text-xs">
          <div className="text-sand font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
            <span>OFFICIAL ELIGIBILITY MANDATE: SAME DEGREE REQUIREMENT</span>
            {degreeCode && (
              <span className="px-2 py-0.5 bg-surface border border-gunmetal text-sand font-bold text-[10px]">
                DEGREE CODE: {degreeCode}
              </span>
            )}
          </div>
          <p className="text-tacticalWhite/90 leading-relaxed text-[11px]">
            Tournament regulations dictate that every squad member must belong to the <strong className="text-sand">same Degree Programme</strong>. The system automatically identifies each operative&apos;s degree using their enrolment number (e.g. <span className="text-sand font-bold">UWU/{degreeCode || 'CST'}/22/001</span>).
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {members.map((member, idx) => {
          const isLeader = idx === 0;
          return (
            <div
              key={idx}
              className={`p-5 border transition-all ${
                isLeader
                  ? 'bg-olive/15 border-olive/60'
                  : 'bg-surface/50 border-gunmetal'
              }`}
            >
              <div className="flex items-center justify-between mb-4 border-b border-gunmetal/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-surface border border-gunmetal flex items-center justify-center text-xs font-mono text-sand font-bold">
                    0{idx + 1}
                  </span>
                  <span className="font-display font-bold text-sm uppercase text-tacticalWhite tracking-wider">
                    {isLeader ? 'MEMBER 1 — TEAM LEADER (CAPTAIN)' : `MEMBER 0${idx + 1} — SQUAD OPERATIVE`}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 uppercase border font-bold ${
                  isLeader
                    ? 'bg-olive/30 text-sand border-olive'
                    : 'bg-card text-mutedKhaki border-gunmetal'
                }`}>
                  {isLeader ? 'TEAM LEADER // PRIMARY CONTACT' : `OPERATIVE 0${idx + 1}`}
                </span>
              </div>

              {/* Balanced 2x2 Field Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* 1. Member Full Name */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                    <span className="font-bold flex items-center gap-1">
                      FULL NAME <span className="text-sand">*</span>
                    </span>
                    <span className="text-[10px] text-mutedKhaki/80 font-mono bg-card px-1.5 py-0.2 border border-gunmetal">
                      OFFICIAL NAME
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={isLeader ? 'Team leader full name (e.g. Kasun Bandara)' : `Member 0${idx + 1} full name`}
                    value={member.fullName}
                    onChange={(e) => onMemberChange(idx, 'fullName', e.target.value)}
                    className={`h-10 w-full bg-surface border px-3.5 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
                      errors[`m_${idx}_fullName`]
                        ? 'border-rose-500'
                        : member.fullName.trim().length >= 2
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : 'border-gunmetal focus:border-olive'
                    }`}
                  />
                  {errors[`m_${idx}_fullName`] && (
                    <p className="text-[10px] font-mono text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors[`m_${idx}_fullName`]}</span>
                    </p>
                  )}
                </div>

                {/* 2. In Game Name (Callsign) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                    <span className="font-bold flex items-center gap-1">
                      IN GAME NAME <span className="text-sand">*</span>
                    </span>
                    <span className="text-[10px] text-sand font-mono bg-card px-1.5 py-0.2 border border-gunmetal font-bold">
                      CALLSIGN
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Viper, Ghost, Apex"
                    value={member.gamingName}
                    onChange={(e) => onMemberChange(idx, 'gamingName', e.target.value)}
                    className={`h-10 w-full bg-surface border px-3.5 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
                      errors[`m_${idx}_gamingName`]
                        ? 'border-rose-500'
                        : member.gamingName.trim().length >= 1
                        ? 'border-emerald-500/70 focus:border-emerald-400'
                        : 'border-gunmetal focus:border-olive'
                    }`}
                  />
                  {errors[`m_${idx}_gamingName`] && (
                    <p className="text-[10px] font-mono text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors[`m_${idx}_gamingName`]}</span>
                    </p>
                  )}
                </div>

                {/* 3. Academic Year Dropdown */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                    <span className="font-bold flex items-center gap-1">
                      ACADEMIC YEAR <span className="text-sand">*</span>
                    </span>
                    <span className="text-[10px] text-mutedKhaki/80 font-mono bg-card px-1.5 py-0.2 border border-gunmetal">
                      1ST – 4TH YEAR
                    </span>
                  </div>
                  <select
                    value={member.year}
                    onChange={(e) => onMemberChange(idx, 'year', e.target.value)}
                    className={`h-10 w-full bg-surface border px-3 text-xs font-mono text-tacticalWhite focus:outline-none transition-colors ${
                      errors[`m_${idx}_year`] ? 'border-rose-500' : 'border-gunmetal focus:border-olive'
                    }`}
                  >
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y} className="bg-military-black text-tacticalWhite">
                        Year {y}
                      </option>
                    ))}
                  </select>
                  {errors[`m_${idx}_year`] && (
                    <p className="text-[10px] font-mono text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors[`m_${idx}_year`]}</span>
                    </p>
                  )}
                </div>

                {/* 4. Enrollment Number */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                    <span className="font-bold flex items-center gap-1">
                      ENROLLMENT NO. <span className="text-sand">*</span>
                    </span>
                    <span className="text-[10px] text-sand font-mono bg-card px-1.5 py-0.2 border border-gunmetal font-bold">
                      UWU/{degreeCode || 'DEG'}/YY/NNN
                    </span>
                  </div>
                  {(() => {
                    const val = member.enrollmentNumber.trim();
                    const hasError = Boolean(errors[`m_${idx}_enrollmentNumber`]);
                    let borderClass = 'border-gunmetal focus:border-olive';

                    if (hasError) {
                      borderClass = 'border-rose-500';
                    } else if (val) {
                      const strictCheck = validateStrictEnrollmentFormat(val);
                      const deg = extractDegreeFromEnrollment(val);
                      const expectedCode = getDegreeCodeFromName(degreeProgram);
                      const isDup = members.some(
                        (m, i) => i !== idx && m.enrollmentNumber.trim().toUpperCase() === val.toUpperCase()
                      );
                      if (strictCheck.isValid && !isDup && deg && (!expectedCode || deg.code === expectedCode)) {
                        borderClass = 'border-emerald-500/70 focus:border-emerald-400';
                      } else if (!strictCheck.isValid || isDup || (deg && expectedCode && deg.code !== expectedCode)) {
                        borderClass = 'border-rose-500';
                      }
                    }

                    return (
                      <input
                        type="text"
                        placeholder={`e.g. UWU/${degreeCode || 'CST'}/22/00${idx + 1}`}
                        value={member.enrollmentNumber}
                        onChange={(e) => onMemberChange(idx, 'enrollmentNumber', e.target.value.toUpperCase())}
                        className={`h-10 w-full bg-surface border px-3.5 text-xs font-mono text-tacticalWhite focus:outline-none uppercase tracking-wider font-semibold transition-colors ${borderClass}`}
                      />
                    );
                  })()}

                  {/* Real-time degree recognition badge */}
                  {(() => {
                    const val = member.enrollmentNumber.trim();
                    if (!val) return null;
                    const strictCheck = validateStrictEnrollmentFormat(val);
                    if (!strictCheck.isValid) {
                      return (
                        <p className="text-[10px] font-mono text-amber-400 mt-1 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{strictCheck.error || 'Strict format required: UWU/<DEGREE>/<YEAR>/<NO> (e.g. UWU/CST/23/111)'}</span>
                        </p>
                      );
                    }

                    // Check for duplicate inside the squad
                    const upperVal = val.toUpperCase();
                    const duplicateIdx = members.findIndex(
                      (m, i) => i !== idx && m.enrollmentNumber.trim().toUpperCase() === upperVal
                    );
                    if (duplicateIdx !== -1) {
                      const dupRole = duplicateIdx === 0 ? 'Member 1 (Leader)' : `Member ${duplicateIdx + 1}`;
                      return (
                        <p className="text-[10px] font-mono text-rose-400 mt-1 flex items-center gap-1 font-bold">
                          <XCircle className="w-3 h-3 shrink-0" />
                          <span>DUPLICATE DETECTED: This number is already entered for {dupRole}!</span>
                        </p>
                      );
                    }

                    const deg = extractDegreeFromEnrollment(val);
                    const expectedCode = getDegreeCodeFromName(degreeProgram);
                    if (!deg) {
                      return (
                        <p className="text-[10px] font-mono text-amber-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Unrecognized format. Enter official UWU enrollment number (e.g. UWU/CST/23/111)</span>
                        </p>
                      );
                    }
                    if (expectedCode && deg.code !== expectedCode) {
                      return (
                        <p className="text-[10px] font-mono text-rose-400 mt-1 flex items-center gap-1 font-bold">
                          <XCircle className="w-3 h-3 shrink-0" />
                          <span>DEGREE MISMATCH: Identified &apos;{deg.code}&apos; ({deg.name}), but squad degree is &apos;{expectedCode}&apos;. All members must have the same degree.</span>
                        </p>
                      );
                    }
                    return (
                      <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>VERIFIED DEGREE: {deg.code} — {deg.name}</span>
                      </p>
                    );
                  })()}

                  {errors[`m_${idx}_enrollmentNumber`] && (
                    <p className="text-[10px] font-mono text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors[`m_${idx}_enrollmentNumber`]}</span>
                    </p>
                  )}
                </div>

                {/* 5. Player Config (.cfg) File */}
                <div className="md:col-span-2 pt-2 border-t border-gunmetal/40">
                  <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                    <span className="font-bold flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-sand" />
                      PLAYER CONFIG FILE (.CFG)
                    </span>
                    <span className="text-[10px] text-sand font-mono bg-card px-1.5 py-0.2 border border-gunmetal font-bold">
                      ONLY .CFG ALLOWED
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-sand" />
                      <span>{member.configFileName ? 'CHANGE .CFG FILE' : 'CHOOSE .CFG FILE'}</span>
                      <input
                        type="file"
                        accept=".cfg"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onMemberConfigFile(idx, file);
                        }}
                        className="hidden"
                      />
                    </label>

                    {member.configFileName ? (
                      <div className="flex items-center justify-between flex-1 px-3 py-2 bg-card border border-olive/50 text-xs font-mono">
                        <div className="flex items-center gap-2 truncate">
                          <FileCode2 className="w-3.5 h-3.5 text-sand shrink-0" />
                          <span className="text-sand font-bold truncate">{member.configFileName}</span>
                          <span className="text-[10px] text-mutedKhaki">
                            ({((member.configFile?.size || 0) / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onMemberConfigFile(idx, null)}
                          className="text-mutedKhaki hover:text-rose-400 p-1 transition-colors ml-2"
                          title="Remove config file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-mutedKhaki flex items-center">
                        No .cfg file selected (Upload custom COD4 player config)
                      </span>
                    )}
                  </div>
                  {errors[`m_${idx}_cfg`] && (
                    <p className="text-[10px] font-mono text-rose-500 mt-1">{errors[`m_${idx}_cfg`]}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
