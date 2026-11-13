import React from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock } from 'lucide-react';
import { Step1FormData } from './Step1TeamIdentity';
import { MemberFormState } from './Step2MemberRoster';

interface Step3ReviewConfirmProps {
  form: Step1FormData;
  members: MemberFormState[];
}

export default function Step3ReviewConfirm({ form, members }: Step3ReviewConfirmProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gunmetal pb-4 mb-6">
        <h3 className="font-display font-black text-xl text-tacticalWhite uppercase tracking-wider">
          STEP 3: REVIEW &amp; CONFIRM ENLISTMENT DOSSIER
        </h3>
        <p className="text-xs font-mono text-mutedKhaki mt-1">
          Verify all transmission telemetry prior to ratifying registration with the CST LAN Challenge 2026 committee.
        </p>
      </div>

      <div className="bg-surface/70 border border-gunmetal p-6 font-mono text-xs space-y-6">
        {/* Team Header */}
        <div className="flex items-center gap-4 border-b border-gunmetal pb-4">
          <div className="relative w-16 h-16 bg-card border border-gunmetal shrink-0 overflow-hidden">
            <Image src={form.logo} alt="Team Logo" fill className="object-cover" sizes="64px" />
          </div>
          <div>
            <div className="text-sand font-bold text-lg">[{form.teamTag}] {form.teamName}</div>
            <div className="text-tacticalWhite">{form.degreeProgram}</div>
            <div className="text-mutedKhaki text-[11px]">Uva Wellassa University of Sri Lanka</div>
          </div>
        </div>

        {/* Team Academic & Contact Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-gunmetal pb-4 text-mutedKhaki text-xs">
          <div>
            <span className="text-sand font-bold block uppercase">EMAIL ADDRESS:</span>
            <span className="text-tacticalWhite">{form.email}</span>
          </div>
          <div>
            <span className="text-sand font-bold block uppercase">WHATSAPP NUMBER:</span>
            <span className="text-emerald-400 font-bold">{form.whatsappNumber}</span>
          </div>
          <div>
            <span className="text-sand font-bold block uppercase">DEGREE PROGRAMME:</span>
            <span className="text-tacticalWhite font-bold">{form.degreeProgram}</span>
          </div>
        </div>

        {/* 5 Squad Members */}
        <div>
          {/* Verified Squad Degree Banner */}
          <div className="p-3 bg-olive/20 border border-olive flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-mutedKhaki uppercase block">VERIFIED SQUAD DEGREE PROGRAMME:</span>
                <span className="text-sand font-bold text-xs sm:text-sm">{form.degreeProgram}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono px-2.5 py-1 bg-surface border border-emerald-500/40 font-bold shrink-0">
              ✓ 5/5 OPERATIVES SHARE SAME DEGREE
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sand font-bold uppercase text-xs">
              5 SQUAD OPERATIVES (EACH WITH INDIVIDUAL ENROLLMENT NUMBER):
            </span>
            <span className="text-[11px] text-mutedKhaki">
              {form.degreeProgram}
            </span>
          </div>

          <div className="space-y-2">
            {members.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  idx === 0
                    ? 'bg-olive/20 border-olive/60'
                    : 'bg-card border-gunmetal'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sand font-bold">0{idx + 1}.</span>
                  <span className="text-tacticalWhite font-bold">{m.fullName}</span>
                  <span className="text-sand">[{m.gamingName}]</span>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-sand text-black uppercase font-mono">
                      LEADER
                    </span>
                  )}
                  {m.configFileName && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-olive/30 border border-olive text-sand">
                      .CFG ATTACHED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-mutedKhaki text-[11px]">
                  <span>Year {m.year}</span>
                  <span className="text-sand font-bold font-mono">{m.enrollmentNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-sand/10 border border-sand/30 flex items-center gap-2 text-[11px] text-sand">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Please verify all operative credentials. Roster lock will apply upon confirmation.
          </span>
        </div>
      </div>
    </div>
  );
}
