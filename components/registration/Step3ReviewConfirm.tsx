'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Upload,
  Receipt,
  FileText,
  Trash2,
  AlertCircle,
  Building2,
  CreditCard,
  Hash,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Step1FormData } from './Step1TeamIdentity';
import { MemberFormState } from './Step2MemberRoster';

interface Step3ReviewConfirmProps {
  form: Step1FormData;
  members: MemberFormState[];
  paymentSlipFile?: File | null;
  paymentSlipPreview?: string;
  paymentSlipName?: string;
  onPaymentSlipSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePaymentSlip?: () => void;
  paymentSlipError?: string;
}

export default function Step3ReviewConfirm({
  form,
  members,
  paymentSlipFile = null,
  paymentSlipPreview = '',
  paymentSlipName = '',
  onPaymentSlipSelect,
  onRemovePaymentSlip,
  paymentSlipError,
}: Step3ReviewConfirmProps) {
  const isPdf =
    paymentSlipName.toLowerCase().endsWith('.pdf') ||
    paymentSlipPreview.startsWith('data:application/pdf');

  return (
    <div className="space-y-6">
      <div className="border-b border-gunmetal pb-4 mb-6">
        <h3 className="font-display font-black text-xl text-tacticalWhite uppercase tracking-wider">
          STEP 3: REVIEW &amp; CONFIRM ENLISTMENT DOSSIER
        </h3>
        <p className="text-xs font-mono text-mutedKhaki mt-1">
          Verify all transmission telemetry and attach your tournament payment slip prior to ratifying registration with the CST LAN Challenge 2026 committee.
        </p>
      </div>

      <div className="bg-surface/70 border border-gunmetal p-6 font-mono text-xs space-y-6">
        {/* Team Header */}
        <div className="flex items-center gap-4 border-b border-gunmetal pb-4">
          <div className="relative w-16 h-16 bg-card border border-gunmetal shrink-0 overflow-hidden">
            <Image src={form.logo} alt="Team Logo" fill className="object-cover" sizes="64px" />
          </div>
          <div>
            <div className="text-sand font-bold text-lg">
              [{form.teamTag}] {form.teamName}
            </div>
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
                <span className="text-[10px] text-mutedKhaki uppercase block">
                  VERIFIED SQUAD DEGREE PROGRAMME:
                </span>
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
            <span className="text-[11px] text-mutedKhaki">{form.degreeProgram}</span>
          </div>

          <div className="space-y-2">
            {members.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  idx === 0 ? 'bg-olive/20 border-olive/60' : 'bg-card border-gunmetal'
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

        {/* ========================================================================= */}
        {/* PAYMENT SLIP & BANK TRANSFER TRANSMISSION SECTION                         */}
        {/* ========================================================================= */}
        <div className="border-t border-gunmetal pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sand" />
              <h4 className="font-display font-black text-sm uppercase tracking-wider text-tacticalWhite">
                TOURNAMENT REGISTRATION PAYMENT SLIP
              </h4>
            </div>
            {paymentSlipFile || paymentSlipPreview ? (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold uppercase">
                ✓ RECEIPT ATTACHED
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase">
                ATTACH SLIP FOR APPROVAL
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-mutedKhaki mb-4">
            Transfer tournament entry fee to the official account below and upload your bank deposit receipt / transfer slip for committee verification and squad approval.
          </p>

          {/* Bank Account Wire Information Card */}
          <div className="p-4 bg-surface border border-gunmetal/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-[10px] text-mutedKhaki uppercase flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3 text-sand" /> BANK &amp; BRANCH
              </span>
              <span className="text-tacticalWhite font-bold text-xs block">Bank of Ceylon (BOC)</span>
              <span className="text-[11px] text-mutedKhaki">Badulla Branch</span>
            </div>

            <div>
              <span className="text-[10px] text-mutedKhaki uppercase flex items-center gap-1 mb-1">
                <CreditCard className="w-3 h-3 text-sand" /> ACCOUNT NAME
              </span>
              <span className="text-tacticalWhite font-bold text-xs block truncate" title="CST LAN Challenge 2026">
                CST LAN Challenge 2026
              </span>
              <span className="text-[11px] text-mutedKhaki">UWU Computer Science</span>
            </div>

            <div>
              <span className="text-[10px] text-mutedKhaki uppercase flex items-center gap-1 mb-1">
                <Hash className="w-3 h-3 text-sand" /> ACCOUNT NUMBER
              </span>
              <span className="text-sand font-mono font-bold text-sm block">0008342190</span>
              <span className="text-[10px] text-emerald-400">Current Account</span>
            </div>

            <div>
              <span className="text-[10px] text-mutedKhaki uppercase flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3 h-3 text-sand" /> PAYMENT REFERENCE
              </span>
              <span className="text-sand font-mono font-bold text-xs block">
                [{form.teamTag || 'TEAM_TAG'}]
              </span>
              <span className="text-[10px] text-mutedKhaki">Include tag in slip narration</span>
            </div>
          </div>

          {/* Payment Slip Upload Box */}
          <div
            className={`p-4 border transition-colors ${
              paymentSlipFile || paymentSlipPreview
                ? 'bg-olive/10 border-olive/50'
                : paymentSlipError
                ? 'bg-rose-950/20 border-rose-500'
                : 'bg-card border-gunmetal hover:border-olive/50'
            }`}
          >
            {paymentSlipFile || paymentSlipPreview ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Thumbnail / Icon */}
                  {isPdf ? (
                    <div className="w-16 h-16 bg-surface border border-gunmetal flex flex-col items-center justify-center text-sand shrink-0">
                      <FileText className="w-6 h-6 mb-1" />
                      <span className="text-[9px] font-bold">PDF</span>
                    </div>
                  ) : paymentSlipPreview ? (
                    <div className="relative w-16 h-16 bg-surface border border-gunmetal overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={paymentSlipPreview}
                        alt="Payment Slip Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-surface border border-gunmetal flex items-center justify-center text-sand shrink-0">
                      <Receipt className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sand font-bold text-xs uppercase">
                        {paymentSlipFile?.name || paymentSlipName || 'payment_receipt.png'}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                      ✓ Ready for transmission with registration
                    </span>
                    {paymentSlipFile?.size && (
                      <span className="text-[10px] text-mutedKhaki block">
                        {(paymentSlipFile.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                        {isPdf ? 'PDF Document' : 'Image Receipt'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <label className="cursor-pointer px-3 py-1.5 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>CHANGE SLIP</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={onPaymentSlipSelect}
                      className="hidden"
                    />
                  </label>

                  {onRemovePaymentSlip && (
                    <button
                      type="button"
                      onClick={onRemovePaymentSlip}
                      className="px-3 py-1.5 bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-300 text-xs font-mono transition-colors flex items-center gap-1.5"
                      title="Remove Payment Slip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>REMOVE</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-surface border border-gunmetal flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-sand" />
                  </div>
                  <div>
                    <span className="text-tacticalWhite font-bold block text-xs">
                      ATTACH BANK DEPOSIT SLIP OR ONLINE TRANSFER RECEIPT
                    </span>
                    <span className="text-[11px] text-mutedKhaki block">
                      Accepted formats: JPG, PNG, WEBP, PDF (Maximum 10MB)
                    </span>
                  </div>
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive hover:bg-olive-light text-black font-display font-black text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>UPLOAD PAYMENT SLIP</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={onPaymentSlipSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {paymentSlipError && (
              <p className="text-[11px] font-mono text-rose-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{paymentSlipError}</span>
              </p>
            )}
          </div>
        </div>

        <div className="p-3 bg-sand/10 border border-sand/30 flex items-center gap-2 text-[11px] text-sand">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Please verify all operative credentials and payment telemetry. Roster lock will apply upon confirmation.
          </span>
        </div>
      </div>
    </div>
  );
}
