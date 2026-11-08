'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { saveTeam, getStoredTeams, getLiveBroadcastChannel } from '@/lib/storage';
import { Team, Player, Captain, UWU_FACULTIES } from '@/lib/types';
import {
  Shield,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle,
  CheckCircle2,
  Users,
  Crosshair,
  Loader2,
  Phone,
  GraduationCap,
  Lock,
  Calendar,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function RegisterPage() {
  const router = useRouter();
  const { isOpen } = useRegistrationStatus();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);

  // Form State
  const [teamInfo, setTeamInfo] = useState({
    name: '',
    tag: '',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    logoFile: null as File | null,
  });

  const [captainInfo, setCaptainInfo] = useState<Captain>({
    name: '',
    whatsappNumber: '',
    faculty: 'Faculty of Applied Sciences',
    email: '',
    phone: '',
  });

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', faculty: 'Faculty of Applied Sciences', ign: '', steamId: '', email: '', role: 'Player 1' },
    { id: '2', name: '', faculty: 'Faculty of Applied Sciences', ign: '', steamId: '', email: '', role: 'Player 2' },
    { id: '3', name: '', faculty: 'Faculty of Applied Sciences', ign: '', steamId: '', email: '', role: 'Player 3' },
    { id: '4', name: '', faculty: 'Faculty of Applied Sciences', ign: '', steamId: '', email: '', role: 'Player 4' },
    { id: '5', name: '', faculty: 'Faculty of Applied Sciences', ign: '', steamId: '', email: '', role: 'Player 5' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image upload handling
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeamInfo((prev) => ({ ...prev, logoFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTeamInfo((prev) => ({
          ...prev,
          logo: result,
          logoPreview: result,
          logoFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!teamInfo.name.trim()) newErrors.teamName = 'Team name is required';
      if (!teamInfo.tag.trim()) newErrors.teamTag = 'Team tag (e.g. UWU.V) is required';
    }

    if (step === 2) {
      if (!captainInfo.name.trim()) newErrors.capName = 'Team leader full name is required';
      const cleanWa = captainInfo.whatsappNumber.replace(/[\s\-\+]/g, '');
      if (!cleanWa || cleanWa.length < 9) {
        newErrors.capWhatsapp = 'Valid WhatsApp contact number required (e.g. 0771234567)';
      }
      if (!captainInfo.faculty) newErrors.capFaculty = 'Leader faculty is required';
    }

    if (step === 3) {
      for (let idx = 1; idx < 5; idx++) {
        const p = players[idx];
        if (!p || !p.name.trim()) newErrors[`p_${idx}_name`] = `Player 0${idx + 1} name required`;
        if (!p || !p.faculty.trim()) newErrors[`p_${idx}_faculty`] = `Select faculty for Player 0${idx + 1}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        setPlayers((prev) => {
          const updated = [...prev];
          updated[0] = {
            id: '1',
            name: captainInfo.name.trim(),
            faculty: captainInfo.faculty || 'Faculty of Applied Sciences',
            ign: '',
            steamId: '',
            email: captainInfo.email?.trim() || '',
            role: 'Team Leader',
          };
          return updated;
        });
      }
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Please fill out all required fields across all steps.');
      return;
    }

    setIsSubmitting(true);

    const rosterPlayers = [
      {
        fullName: captainInfo.name.trim(),
        faculty: (captainInfo.faculty || 'Faculty of Applied Sciences').trim(),
        inGameName: '',
        steamId: '',
        email: captainInfo.email?.trim() || '',
        role: 'Team Leader',
      },
      ...players.slice(1, 5).map((p, idx) => ({
        fullName: p.name.trim(),
        faculty: p.faculty.trim(),
        inGameName: (p.ign || '').trim(),
        steamId: (p.steamId || '').trim(),
        email: p.email?.trim() || '',
        role: `Player 0${idx + 2}`,
      })),
    ];

    const payload = {
      teamName: teamInfo.name.trim(),
      teamTag: teamInfo.tag.trim().toUpperCase(),
      university: 'Uva Wellassa University of Sri Lanka',
      teamLogo: teamInfo.logo,
      captain: {
        name: captainInfo.name.trim(),
        whatsappNumber: captainInfo.whatsappNumber.trim(),
        faculty: captainInfo.faculty,
        email: captainInfo.email?.trim() || '',
        phone: captainInfo.whatsappNumber.trim(),
      },
      players: rosterPlayers,
    };

    try {
      let res;
      if (teamInfo.logoFile) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        formData.append('logo', teamInfo.logoFile);
        res = await api.registrations.submit(formData);
      } else {
        res = await api.registrations.submit(payload);
      }

      if (res.success && res.data) {
        const teamObj: Team = {
          id: res.data.registrationNumber,
          name: res.data.teamName,
          tag: res.data.teamTag,
          university: 'Uva Wellassa University of Sri Lanka',
          logo: teamInfo.logo,
          status: 'pending',
          createdAt: res.data.createdAt,
          captain: {
            ...captainInfo,
            phone: captainInfo.whatsappNumber,
          },
          players: [
            {
              id: '1',
              name: captainInfo.name.trim(),
              faculty: captainInfo.faculty || 'Faculty of Applied Sciences',
              ign: '',
              steamId: '',
              email: captainInfo.email?.trim() || '',
              role: 'Team Leader',
            },
            ...players.slice(1, 5),
          ],
        };

        const existing = getStoredTeams();
        if (!existing.some((t) => t.id === teamObj.id || t.name.toLowerCase() === teamObj.name.toLowerCase())) {
          const updated = [teamObj, ...existing];
          localStorage.setItem('cst_lan_teams_2026', JSON.stringify(updated));
          window.dispatchEvent(new Event('cst_teams_updated'));
          try {
            const channel = getLiveBroadcastChannel();
            channel?.postMessage({
              type: 'CST_TEAMS_UPDATE',
              teams: updated,
              timestamp: Date.now(),
            });
          } catch (e) {}
        }

        setCreatedTeam(teamObj);
        setIsSubmitted(true);
        window.scrollTo({ top: 80, behavior: 'smooth' });
        return;
      }
    } catch (err: any) {
      console.warn('Backend API submission note:', err);
      if (err.errors && err.errors.length > 0) {
        setApiError(err.errors.map((e: any) => e.message).join(' | '));
        setIsSubmitting(false);
        return;
      }
      if (err.message && err.message !== 'Failed to fetch') {
        setApiError(err.message);
        setIsSubmitting(false);
        return;
      }

      const created = saveTeam({
        name: teamInfo.name,
        tag: teamInfo.tag.toUpperCase(),
        university: 'Uva Wellassa University of Sri Lanka',
        logo: teamInfo.logo,
        captain: {
          ...captainInfo,
          phone: captainInfo.whatsappNumber,
        },
        players,
      });

      setCreatedTeam(created);
      setIsSubmitted(true);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'TEAM IDENTITY' },
    { num: 2, label: 'LEADER CONTACT' },
    { num: 3, label: '4 SQUAD MEMBERS' },
    { num: 4, label: 'CONFIRM' },
  ];

  if (!isOpen) {
    return (
      <div className="pt-28 pb-24 bg-[#080B10] min-h-screen">
        <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-secondaryText mb-8">
            <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-white">ENLISTMENT PORTAL</span>
          </div>

          <div className="relative bg-[#080B10]/95 border-2 border-rose-500/50 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(244,63,94,0.2)]">
            <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-rose-500" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-rose-500" />
            <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-rose-500" />
            <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-rose-500" />

            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center mx-auto mb-6 text-rose-400">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono uppercase tracking-widest font-bold mb-4">
              <span>ADMINISTRATIVE GATE // CLOSED</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-white tracking-tight mb-3">
              REGISTRATIONS ARE CURRENTLY <span className="text-rose-500">CLOSED</span>
            </h1>

            <p className="text-xs sm:text-sm font-mono text-secondaryText leading-relaxed max-w-lg mx-auto mb-8">
              Official team submissions for CST LAN Challenge 2026 have been closed by the tournament administrators. Existing verified rosters and brackets are now entering the competition phase.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/teams" variant="cyan" size="md" icon={<Users className="w-4 h-4" />}>
                VIEW REGISTERED SQUADS
              </Button>
              <Button href="/schedule" variant="outline" size="md" icon={<Calendar className="w-4 h-4" />}>
                VIEW MATCH SCHEDULE
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-[#080B10] min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex items-center gap-2 text-xs font-mono text-secondaryText mb-8">
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-white">ENLISTMENT PORTAL</span>
        </div>

        <div className="bg-surface/90 border border-cyan/40 p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan/10 border border-cyan/50 flex items-center justify-center shrink-0 text-cyan">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold block">
                UVA WELLASSA UNIVERSITY OF SRI LANKA // OFFICIAL REGISTRATION
              </span>
              <span className="text-secondaryText text-[11px]">
                CS2 Inter-Faculty Championship • Exclusively for Uva Wellassa University Students
              </span>
            </div>
          </div>
          <span className="text-cyan font-bold px-2.5 py-1 bg-surface border border-cyan/30 text-[10px] uppercase shrink-0">
            5V5 MR12 COMPETITIVE
          </span>
        </div>

        <div className="border-b border-tactical-border pb-8 mb-10">
          <Badge variant="cyan" size="sm" className="mb-2">
            SQUAD REGISTRATION // 2026
          </Badge>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
            TEAM <span className="text-cyan">ENLISTMENT</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-secondaryText mt-1">
            Organized by the <strong className="text-white">Computer Science and Technology Degree Programme</strong>, Faculty of Applied Sciences, Uva Wellassa University.
          </p>
        </div>

        {!isSubmitted && (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-12">
            {steps.map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`p-3 text-center border font-mono text-xs transition-colors clip-tactical ${
                    isCurrent
                      ? 'bg-surface border-cyan text-cyan font-bold shadow-[0_0_15px_rgba(0,213,255,0.2)]'
                      : isPassed
                      ? 'bg-surface/40 border-emerald-500/50 text-emerald-400'
                      : 'bg-card/40 border-tactical-border text-secondaryText/60'
                  }`}
                >
                  <div className="text-[10px] opacity-70">STEP 0{s.num}</div>
                  <div className="font-display font-bold uppercase tracking-wider text-xs sm:text-sm truncate">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {apiError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-mono mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {isSubmitted && createdTeam ? (
          <div className="bg-card border border-emerald-500/50 p-8 sm:p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <Badge variant="green" size="md" className="mb-4">
              ENLISTMENT RECORDED IN TOURNAMENT REGISTRY
            </Badge>

            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-white tracking-wider mb-2">
              SQUAD ENLISTMENT SUCCESSFUL
            </h2>

            <p className="text-xs sm:text-sm font-mono text-secondaryText max-w-lg mx-auto mb-8">
              Your registration for <strong className="text-white">{createdTeam.name} [{createdTeam.tag}]</strong> has been registered under reference: <span className="text-cyan font-bold">{createdTeam.id}</span>. Status: <span className="text-tactical-gold font-bold">PENDING ADMINISTRATIVE APPROVAL</span>.
            </p>

            <div className="bg-surface/80 border border-tactical-border p-6 max-w-xl mx-auto text-left font-mono text-xs mb-8">
              <div className="flex items-center gap-4 border-b border-tactical-border pb-4 mb-4">
                <div className="relative w-12 h-12 bg-card border border-tactical-border overflow-hidden shrink-0">
                  <Image src={createdTeam.logo} alt={createdTeam.name} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <div className="text-cyan font-bold">{createdTeam.name} [{createdTeam.tag}]</div>
                  <div className="text-secondaryText">Uva Wellassa University of Sri Lanka</div>
                </div>
              </div>

              <div className="space-y-2 text-secondaryText">
                <div>
                  <span className="text-white font-bold">TEAM LEADER:</span> {createdTeam.captain.name}
                  {createdTeam.captain.whatsappNumber && (
                    <span className="text-emerald-400 ml-2 font-bold">
                      [WhatsApp: {createdTeam.captain.whatsappNumber}]
                    </span>
                  )}
                  {createdTeam.captain.faculty && (
                    <span className="text-secondaryText ml-2">({createdTeam.captain.faculty})</span>
                  )}
                </div>
                <div>
                  <span className="text-white font-bold">5-PLAYER LINEUP:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                    {createdTeam.players.map((p, idx) => (
                      <div key={idx} className="p-1.5 bg-card border border-tactical-border/60 text-[11px]">
                        <span className="text-cyan font-bold">0{idx + 1}. {p.name || `Player ${idx + 1}`}</span>
                        <div className="text-secondaryText truncate">{p.faculty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/teams" variant="cyan" size="md">
                VIEW REGISTERED SQUADS
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setTeamInfo({
                    name: '',
                    tag: '',
                    university: 'Uva Wellassa University of Sri Lanka',
                    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                    logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                    logoFile: null,
                  });
                }}
                variant="ghost"
                size="md"
              >
                ENLIST ANOTHER SQUAD
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/90 border border-tactical-border p-6 sm:p-10 backdrop-blur-md">
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-tactical-border pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                      STEP 1: SQUAD DETAILS & LOGO
                    </h3>
                    <p className="text-xs font-mono text-secondaryText">
                      Provide your squad designation and official team emblem.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      TEAM NAME <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cyber Strikers"
                      value={teamInfo.name}
                      onChange={(e) => setTeamInfo({ ...teamInfo, name: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                    {errors.teamName && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.teamName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      TEAM TAG (2-8 CHARACTERS) <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UWU.V"
                      maxLength={8}
                      value={teamInfo.tag}
                      onChange={(e) => setTeamInfo({ ...teamInfo, tag: e.target.value.toUpperCase() })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan uppercase"
                    />
                    {errors.teamTag && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.teamTag}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                    UNIVERSITY AFFILIATION
                  </label>
                  <div className="w-full bg-surface/50 border border-tactical-border px-4 py-2.5 text-xs font-mono text-white flex items-center justify-between">
                    <span className="font-bold text-cyan">Uva Wellassa University of Sri Lanka</span>
                    <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30">
                      ✓ UWU INTRA-CHAMPIONSHIP
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-secondaryText mt-1">
                    This tournament is exclusively for registered students of Uva Wellassa University of Sri Lanka.
                  </p>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                    TEAM LOGO (FILE UPLOAD OR PREVIEW)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-surface/50 border border-tactical-border">
                    <div className="relative w-20 h-20 bg-surface border border-cyan/40 shrink-0 overflow-hidden">
                      <Image
                        src={teamInfo.logoPreview}
                        alt="Logo Preview"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-surface border border-tactical-border hover:border-cyan text-xs font-mono text-white transition-colors">
                          <Upload className="w-3.5 h-3.5 text-cyan" />
                          <span>UPLOAD LOGO FILE</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <span className="text-[10px] font-mono text-secondaryText">PNG, JPG, or WEBP (Max 5MB)</span>
                      </div>

                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={teamInfo.logo}
                        onChange={(e) => setTeamInfo({ ...teamInfo, logo: e.target.value, logoPreview: e.target.value })}
                        className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-tactical-border pb-4 mb-6">
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                    STEP 2: TEAM LEADER CONTACT INFORMATION
                  </h3>
                  <p className="text-xs font-mono text-secondaryText">
                    Only the team leader requires a WhatsApp contact number. All match schedules, server IPs, and veto links are sent to the leader.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      LEADER FULL NAME <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kasun Bandara"
                      value={captainInfo.name}
                      onChange={(e) => setCaptainInfo({ ...captainInfo, name: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                    {errors.capName && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.capName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>LEADER WHATSAPP NUMBER <span className="text-cyan">*</span></span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> WHATSAPP ONLY
                      </span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0771234567 or +94 77 123 4567"
                      value={captainInfo.whatsappNumber}
                      onChange={(e) => setCaptainInfo({ ...captainInfo, whatsappNumber: e.target.value, phone: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                    {errors.capWhatsapp && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.capWhatsapp}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan" />
                      <span>LEADER FACULTY <span className="text-cyan">*</span></span>
                    </label>
                    <select
                      value={captainInfo.faculty}
                      onChange={(e) => setCaptainInfo({ ...captainInfo, faculty: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    >
                      {UWU_FACULTIES.map((fac) => (
                        <option key={fac} value={fac} className="bg-[#080B10] text-white">
                          {fac}
                        </option>
                      ))}
                    </select>
                    {errors.capFaculty && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.capFaculty}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      LEADER STUDENT EMAIL (OPTIONAL)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. kasun.b@std.uwu.ac.lk"
                      value={captainInfo.email}
                      onChange={(e) => setCaptainInfo({ ...captainInfo, email: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-tactical-border pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                        STEP 3: 4 SQUAD MEMBERS (PLAYERS 02–05)
                      </h3>
                      <p className="text-xs font-mono text-secondaryText">
                        Team Leader (<span className="text-cyan font-bold">{captainInfo.name || 'Captain'}</span>) is registered as Player 01. Enter details for the remaining 4 students.
                      </p>
                    </div>
                    <Badge variant="cyan" size="sm">4 MEMBERS + 1 LEADER = 5 PLAYERS</Badge>
                  </div>
                </div>

                <div className="p-4 bg-cyan/5 border border-cyan/40 relative">
                  <div className="flex items-center justify-between mb-3 border-b border-cyan/20 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan uppercase flex items-center gap-2">
                      <span className="w-5 h-5 bg-cyan/20 border border-cyan/60 flex items-center justify-center text-[10px] text-cyan font-bold">
                        01
                      </span>
                      <span>PLAYER 01 // TEAM LEADER (CAPTAIN)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 uppercase">
                      ✓ ENTERED IN STEP 02
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                        LEADER FULL NAME
                      </span>
                      <div className="w-full bg-surface/90 border border-tactical-border px-3 py-2 text-xs font-mono text-white font-bold">
                        {captainInfo.name || 'Team Leader'}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-secondaryText uppercase mb-1 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan" />
                        <span>LEADER FACULTY</span>
                      </span>
                      <div className="w-full bg-surface/90 border border-tactical-border px-3 py-2 text-xs font-mono text-white">
                        {captainInfo.faculty}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {players.slice(1, 5).map((player, sliceIdx) => {
                    const idx = sliceIdx + 1; // 1, 2, 3, 4 -> Player 02, 03, 04, 05
                    return (
                      <div key={idx} className="p-4 bg-surface/50 border border-tactical-border relative">
                        <div className="flex items-center justify-between mb-3 border-b border-tactical-border/60 pb-2">
                          <span className="text-xs font-mono font-bold text-cyan uppercase flex items-center gap-2">
                            <span className="w-5 h-5 rounded-none bg-cyan/10 border border-cyan/40 flex items-center justify-center text-[10px]">
                              0{idx + 1}
                            </span>
                            <span>{`PLAYER 0${idx + 1}`}</span>
                          </span>
                          <span className="text-[10px] font-mono text-secondaryText uppercase">UWU STUDENT</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                              FULL NAME <span className="text-cyan">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Student full name"
                              value={player.name}
                              onChange={(e) => {
                                const updated = [...players];
                                updated[idx].name = e.target.value;
                                setPlayers(updated);
                              }}
                              className="w-full bg-surface border border-tactical-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                            />
                            {errors[`p_${idx}_name`] && (
                              <p className="text-[10px] text-rose-500 mt-0.5">{errors[`p_${idx}_name`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-cyan" />
                              <span>FACULTY <span className="text-cyan">*</span></span>
                            </label>
                            <select
                              value={player.faculty}
                              onChange={(e) => {
                                const updated = [...players];
                                updated[idx].faculty = e.target.value;
                                setPlayers(updated);
                              }}
                              className="w-full bg-surface border border-tactical-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                            >
                              {UWU_FACULTIES.map((fac) => (
                                <option key={fac} value={fac} className="bg-[#080B10] text-white">
                                  {fac}
                                </option>
                              ))}
                            </select>
                            {errors[`p_${idx}_faculty`] && (
                              <p className="text-[10px] text-rose-500 mt-0.5">{errors[`p_${idx}_faculty`]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-tactical-border pb-4 mb-6">
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                    STEP 4: REVIEW & CONFIRM DOSSIER
                  </h3>
                  <p className="text-xs font-mono text-secondaryText">
                    Verify all roster entries prior to transmitting data to CST tournament organizers.
                  </p>
                </div>

                <div className="bg-surface/70 border border-tactical-border p-6 font-mono text-xs space-y-6">
                  <div className="flex items-center gap-4 border-b border-tactical-border pb-4">
                    <div className="relative w-16 h-16 bg-card border border-cyan/40 shrink-0 overflow-hidden">
                      <Image src={teamInfo.logo} alt="Team Logo" fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <span className="text-cyan font-bold">[{teamInfo.tag}]</span>
                      <h4 className="font-display font-black text-xl text-white uppercase">{teamInfo.name}</h4>
                      <p className="text-secondaryText">Uva Wellassa University of Sri Lanka</p>
                    </div>
                  </div>

                  <div className="border-b border-tactical-border pb-4">
                    <span className="text-cyan font-bold block mb-2 uppercase">TEAM LEADER:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-secondaryText">
                      <div>NAME: <span className="text-white font-bold">{captainInfo.name}</span></div>
                      <div>WHATSAPP: <span className="text-emerald-400 font-bold">{captainInfo.whatsappNumber}</span></div>
                      <div>FACULTY: <span className="text-white">{captainInfo.faculty}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-cyan font-bold block mb-2 uppercase">5-PLAYER SQUAD ROSTER:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 bg-card border border-cyan/40 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan font-bold text-xs">
                            01. {captainInfo.name || 'Team Leader'}
                          </span>
                          <span className="text-[9px] font-mono text-cyan bg-cyan/10 border border-cyan/30 px-1.5 py-0.5 uppercase">
                            CAPTAIN
                          </span>
                        </div>
                        <div className="text-[10px] text-secondaryText flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-cyan shrink-0" />
                          <span className="text-white">{captainInfo.faculty}</span>
                        </div>
                      </div>

                      {players.slice(1, 5).map((p, sliceIdx) => (
                        <div key={sliceIdx + 1} className="p-3 bg-card border border-tactical-border/70 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-cyan font-bold text-xs">
                              0{sliceIdx + 2}. {p.name || `Player 0${sliceIdx + 2}`}
                            </span>
                          </div>
                          <div className="text-[10px] text-secondaryText flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-cyan shrink-0" />
                            <span className="text-white">{p.faculty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-card border border-cyan/30 text-[11px] text-secondaryText leading-relaxed">
                    By submitting, the team leader certifies that all listed players are officially enrolled students of Uva Wellassa University of Sri Lanka and agree to adhere to competitive CS2 rules.
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-tactical-border flex items-center justify-between">
              {currentStep > 1 ? (
                <Button type="button" onClick={handleBack} variant="ghost" size="md" icon={<ChevronLeft className="w-4 h-4" />}>
                  BACK
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  variant="cyan"
                  size="md"
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  CONTINUE TO STEP 0{currentStep + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="cyan"
                  size="lg"
                  disabled={isSubmitting}
                  icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                  className="font-black"
                >
                  {isSubmitting ? 'TRANSMITTING ENLISTMENT...' : 'CONFIRM & TRANSMIT REGISTRATION'}
                </Button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
