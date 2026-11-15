'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  Phone,
  AlertTriangle,
  Receipt,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { Team } from '@/lib/types';
import TeamLogoAvatar from '@/components/ui/TeamLogoAvatar';

interface PaymentSlipModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (teamId: string) => Promise<void> | void;
  onReject?: (teamId: string) => Promise<void> | void;
  isProcessing?: boolean;
}

export default function PaymentSlipModal({
  team,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing = false,
}: PaymentSlipModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Reset zoom & rotation when team changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, team?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !team) return null;

  const slipUrl = team.paymentSlip?.trim() || '';
  const isPdf = slipUrl.toLowerCase().endsWith('.pdf') || slipUrl.startsWith('data:application/pdf');
  const hasSlip = Boolean(slipUrl);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const downloadFilename = `${(team.tag || 'squad').toLowerCase()}_payment_slip${isPdf ? '.pdf' : '.png'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-military-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-card border border-gunmetal w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface border-b border-gunmetal">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-olive/20 border border-olive/50 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 text-sand" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-sand uppercase tracking-wider">
                  [{team.tag}]
                </span>
                <span className="text-sm font-display font-black text-tacticalWhite uppercase tracking-wider truncate">
                  {team.name}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 uppercase font-bold border ${
                    team.status === 'approved'
                      ? 'bg-olive/20 text-sand border-olive'
                      : team.status === 'rejected'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {team.status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-mutedKhaki truncate">
                Official Bank Transfer Slip / Payment Receipt Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasSlip && (
              <a
                href={slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={downloadFilename}
                className="px-2.5 py-1.5 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-1.5 shrink-0"
                title="Download Payment Slip"
              >
                <Download className="w-3.5 h-3.5 text-sand" />
                <span className="hidden sm:inline">DOWNLOAD</span>
              </a>
            )}

            {hasSlip && (
              <a
                href={slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-surface border border-gunmetal hover:border-sand text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-1.5 shrink-0"
                title="Open Receipt in New Browser Tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sand" />
                <span className="hidden sm:inline">OPEN FULL</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-mutedKhaki hover:text-tacticalWhite border border-gunmetal bg-surface hover:border-rose-500 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Squad Telemetry Banner */}
        <div className="px-5 py-3 bg-surface/50 border-b border-gunmetal/80 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3 text-mutedKhaki">
          <div>
            <span className="text-[10px] text-mutedKhaki/70 block uppercase">DEGREE PROGRAMME</span>
            <span className="text-tacticalWhite font-medium truncate block">
              {team.degreeProgram || 'Computer Science & Tech'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-mutedKhaki/70 block uppercase">SQUAD LEADER</span>
            <span className="text-sand font-bold truncate block">{team.captain?.name}</span>
          </div>

          <div>
            <span className="text-[10px] text-mutedKhaki/70 block uppercase">WHATSAPP NUMBER</span>
            <span className="text-emerald-400 font-bold block">
              {team.captain?.whatsappNumber || team.captain?.phone || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-mutedKhaki/70 block uppercase">REGISTRATION REF</span>
            <span className="text-tacticalWhite font-mono block">
              {team.enrollmentNumber || team.column1 || team.id.slice(0, 12)}
            </span>
          </div>
        </div>

        {/* Viewer Toolbar (For image receipts) */}
        {hasSlip && !isPdf && (
          <div className="flex items-center justify-between px-5 py-2 bg-surface/80 border-b border-gunmetal text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomIn}
                className="px-2 py-1 bg-card border border-gunmetal hover:border-olive text-tacticalWhite hover:text-sand flex items-center gap-1 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ZOOM IN</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="px-2 py-1 bg-card border border-gunmetal hover:border-olive text-tacticalWhite hover:text-sand flex items-center gap-1 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ZOOM OUT</span>
              </button>
              <button
                onClick={handleRotate}
                className="px-2 py-1 bg-card border border-gunmetal hover:border-olive text-tacticalWhite hover:text-sand flex items-center gap-1 transition-colors"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ROTATE</span>
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 bg-card border border-gunmetal hover:border-sand text-mutedKhaki hover:text-tacticalWhite flex items-center gap-1 transition-colors"
                title="Reset View"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{Math.round(zoom * 100)}%</span>
              </button>
            </div>

            <div className="text-[11px] text-mutedKhaki">
              Click &amp; drag or scroll to pan image
            </div>
          </div>
        )}

        {/* Main Content Preview Area */}
        <div className="flex-1 min-h-[300px] max-h-[60vh] overflow-auto bg-black/60 p-4 flex items-center justify-center">
          {!hasSlip ? (
            <div className="text-center p-8 max-w-md">
              <div className="w-12 h-12 mx-auto rounded-full bg-sand/10 border border-sand/30 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-sand" />
              </div>
              <h4 className="font-display font-black text-lg text-tacticalWhite uppercase tracking-wider mb-1">
                NO PAYMENT SLIP ATTACHED
              </h4>
              <p className="text-xs font-mono text-mutedKhaki mb-4">
                This squad registered without uploading a payment slip, or the receipt is pending transmission from the squad leader.
              </p>
              {team.captain?.whatsappNumber && (
                <a
                  href={`https://wa.me/${team.captain.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${team.captain.name}, committee regarding CST LAN Challenge 2026. Please share your squad [${team.tag}] payment receipt for approval.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-olive hover:bg-olive-light text-black font-display font-black text-xs uppercase tracking-wider transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>REQUEST SLIP VIA WHATSAPP</span>
                </a>
              )}
            </div>
          ) : isPdf ? (
            <div className="w-full h-full min-h-[450px] flex flex-col">
              <div className="flex items-center justify-between p-2 bg-surface border border-b-0 border-gunmetal text-xs font-mono text-mutedKhaki">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sand" /> PDF DOCUMENT EMBED
                </span>
                <a
                  href={slipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand underline hover:text-tacticalWhite"
                >
                  Click to open PDF directly
                </a>
              </div>
              <iframe
                src={slipUrl}
                title="Payment Slip PDF"
                className="w-full flex-1 border border-gunmetal bg-surface"
              />
            </div>
          ) : (
            <div
              className="relative max-w-full max-h-full transition-transform duration-200 ease-out select-none"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slipUrl}
                alt={`Payment slip for [${team.tag}] ${team.name}`}
                className="max-w-full max-h-[55vh] object-contain border border-gunmetal shadow-2xl rounded"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-3.5 bg-surface border-t border-gunmetal">
          <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki">
            <Shield className="w-4 h-4 text-olive shrink-0" />
            <span>
              {hasSlip
                ? 'Verify bank stamp, amount, and reference team tag prior to squad approval.'
                : 'Awaiting payment slip submission from team captain.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {team.status !== 'approved' && onApprove && (
              <button
                disabled={isProcessing}
                onClick={async () => {
                  await onApprove(team.id);
                  onClose();
                }}
                className="px-4 py-2 bg-olive hover:bg-olive-light text-black font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE TEAM</span>
              </button>
            )}

            {team.status !== 'rejected' && onReject && (
              <button
                disabled={isProcessing}
                onClick={async () => {
                  await onReject(team.id);
                  onClose();
                }}
                className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-rose-300 font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface border border-gunmetal hover:border-sand text-xs font-mono text-tacticalWhite hover:text-sand transition-colors uppercase font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
