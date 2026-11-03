'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { saveTeam } from '@/lib/storage';
import { Team, Player, Captain } from '@/lib/types';
import { Shield, Check, ChevronRight, ChevronLeft, Upload, AlertCircle, CheckCircle2, User, Users, Crosshair, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);

  // Form State
  const [teamInfo, setTeamInfo] = useState({
    name: '',
    tag: '',
    university: '',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
  });

  const [captainInfo, setCaptainInfo] = useState<Captain>({
    name: '',
    email: '',
    phone: '',
  });

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', ign: '', steamId: '', email: '', role: 'In-Game Leader' },
    { id: '2', name: '', ign: '', steamId: '', email: '', role: 'Entry Fragger' },
    { id: '3', name: '', ign: '', steamId: '', email: '', role: 'Sniper' },
    { id: '4', name: '', ign: '', steamId: '', email: '', role: 'Support' },
    { id: '5', name: '', ign: '', steamId: '', email: '', role: 'Lurker' },
  ]);

  const [substitute, setSubstitute] = useState<Player>({
    id: 'sub',
    name: '',
    ign: '',
    steamId: '',
    email: '',
    role: 'Substitute',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image upload handling
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTeamInfo((prev) => ({
          ...prev,
          logo: result,
          logoPreview: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!teamInfo.name.trim()) newErrors.teamName = 'Team name is required';
      if (!teamInfo.tag.trim()) newErrors.teamTag = 'Team tag (e.g. UWU.V) is required';
      if (!teamInfo.university.trim()) newErrors.university = 'University affiliation is required';
    }

    if (step === 2) {
      if (!captainInfo.name.trim()) newErrors.capName = 'Captain full name is required';
      if (!captainInfo.email.trim() || !captainInfo.email.includes('@')) newErrors.capEmail = 'Valid student email required';
      if (!captainInfo.phone.trim()) newErrors.capPhone = 'Contact phone number required';
    }

    if (step === 3) {
      players.forEach((p, idx) => {
        if (!p.name.trim()) newErrors[`p_${idx}_name`] = `Player ${idx + 1} name required`;
        if (!p.ign.trim()) newErrors[`p_${idx}_ign`] = `Player ${idx + 1} IGN required`;
        if (!p.steamId.trim()) newErrors[`p_${idx}_steamId`] = `Player ${idx + 1} Steam ID required`;
        if (!p.email.trim()) newErrors[`p_${idx}_email`] = `Player ${idx + 1} email required`;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
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

    const hasSub = substitute.name.trim() && substitute.ign.trim();
    setIsSubmitting(true);

    const payload = {
      teamName: teamInfo.name,
      teamTag: teamInfo.tag.toUpperCase(),
      university: teamInfo.university,
      teamLogo: teamInfo.logo,
      captain: captainInfo,
      players: players.map((p) => ({
        fullName: p.name,
        inGameName: p.ign,
        steamId: p.steamId,
        email: p.email,
        role: p.role,
      })),
      ...(hasSub
        ? {
            substitute: {
              fullName: substitute.name,
              inGameName: substitute.ign,
              steamId: substitute.steamId,
              email: substitute.email,
              role: 'SUBSTITUTE',
            },
          }
        : {}),
    };

    try {
      // 1. Try real backend API
      const res = await api.registrations.submit(payload);
      if (res.success && res.data) {
        setCreatedTeam({
          id: res.data.registrationNumber,
          name: res.data.teamName,
          tag: res.data.teamTag,
          university: teamInfo.university,
          logo: teamInfo.logo,
          status: 'pending',
          createdAt: res.data.createdAt,
          captain: captainInfo,
          players,
        });
        setIsSubmitted(true);
        window.scrollTo({ top: 80, behavior: 'smooth' });
        return;
      }
    } catch (err: any) {
      console.warn('Backend API submission warning:', err);
      if (err.errors && err.errors.length > 0) {
        setApiError(err.errors.map((e: any) => e.message).join(' | '));
        setIsSubmitting(false);
        return;
      }
      // If server unreachable, use local fallback
      const created = saveTeam({
        name: teamInfo.name,
        tag: teamInfo.tag.toUpperCase(),
        university: teamInfo.university,
        logo: teamInfo.logo,
        captain: captainInfo,
        players,
        ...(hasSub ? { substitute } : {}),
      });

      setCreatedTeam(created);
      setIsSubmitted(true);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFillDemo = () => {
    setTeamInfo({
      name: 'UWU Shadow Operatives',
      tag: 'UWU.SO',
      university: 'Uva Wellassa University of Sri Lanka',
      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    });
    setCaptainInfo({
      name: 'Praneeth Wijesinghe',
      email: 'praneeth.w@std.uwu.ac.lk',
      phone: '+94 77 456 7890',
    });
    setPlayers([
      { id: '1', name: 'Praneeth Wijesinghe', ign: 'Sh4dow_IGL', steamId: 'STEAM_0:1:78291034', email: 'praneeth.w@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: '2', name: 'Janith Senanayake', ign: 'Crossfire', steamId: 'STEAM_0:0:19283745', email: 'janith.s@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: '3', name: 'Charith Disanayaka', ign: 'SilentBullet', steamId: 'STEAM_0:1:48291056', email: 'charith.d@std.uwu.ac.lk', role: 'Sniper' },
      { id: '4', name: 'Malith Jayawardena', ign: 'CyberShield', steamId: 'STEAM_0:0:93820147', email: 'malith.j@std.uwu.ac.lk', role: 'Support' },
      { id: '5', name: 'Lahiru Rathnayake', ign: 'Nightfall', steamId: 'STEAM_0:1:38291048', email: 'lahiru.r@std.uwu.ac.lk', role: 'Lurker' },
    ]);
    setSubstitute({
      id: 'sub',
      name: 'Sudeera Madushan',
      ign: 'BackupAce',
      steamId: 'STEAM_0:0:58291034',
      email: 'sudeera.m@std.uwu.ac.lk',
      role: 'Substitute',
    });
  };

  const steps = [
    { num: 1, label: 'TEAM INFO' },
    { num: 2, label: 'CAPTAIN' },
    { num: 3, label: 'ROSTER (5+1)' },
    { num: 4, label: 'CONFIRM' },
  ];

  return (
    <div className="pt-28 pb-24 bg-[#080B10] min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-secondaryText mb-8">
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-white">ENLISTMENT PORTAL</span>
        </div>

        {/* Prototype Banner */}
        <div className="bg-surface/80 border border-tactical-border p-3.5 mb-8 flex items-center justify-between text-xs font-mono text-secondaryText">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span>FRONTEND PROTOTYPE: Registrations persist in browser localStorage.</span>
          </div>
          <span className="text-cyan font-bold hidden sm:inline">CST // UWU</span>
        </div>

        {/* Header */}
        <div className="border-b border-tactical-border pb-8 mb-10">
          <Badge variant="cyan" size="sm" className="mb-2">
            SQUAD REGISTRATION // 2026
          </Badge>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
            TEAM <span className="text-cyan">ENLISTMENT</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-secondaryText mt-1">
            Organized by the <strong className="text-white">Computer Science and Technology Degree Programme</strong>, Uva Wellassa University of Sri Lanka.
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
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

        {/* SUCCESS CONFIRMATION SCREEN */}
        {isSubmitted && createdTeam ? (
          <div className="bg-card border border-emerald-500/50 p-8 sm:p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <Badge variant="green" size="md" className="mb-4">
              ENLISTMENT RECORDED IN LOCAL REGISTRY
            </Badge>

            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-white tracking-wider mb-2">
              SQUAD ENLISTMENT SUCCESSFUL
            </h2>

            <p className="text-xs sm:text-sm font-mono text-secondaryText max-w-lg mx-auto mb-8">
              Your registration for <strong className="text-white">{createdTeam.name} [{createdTeam.tag}]</strong> representing <strong className="text-cyan">{createdTeam.university}</strong> has been logged into the demonstration database under status: <span className="text-tactical-gold font-bold">PENDING APPROVAL</span>.
            </p>

            {/* Squad Summary Preview */}
            <div className="bg-surface/80 border border-tactical-border p-6 max-w-xl mx-auto text-left font-mono text-xs mb-8">
              <div className="flex items-center gap-4 border-b border-tactical-border pb-4 mb-4">
                <div className="relative w-12 h-12 bg-card border border-tactical-border overflow-hidden shrink-0">
                  <Image src={createdTeam.logo} alt={createdTeam.name} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <div className="text-cyan font-bold">{createdTeam.name} [{createdTeam.tag}]</div>
                  <div className="text-secondaryText">{createdTeam.university}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-secondaryText">
                <div>CAPTAIN: <span className="text-white">{createdTeam.captain.name} ({createdTeam.captain.phone})</span></div>
                <div>ACTIVE ROSTER: <span className="text-white">{createdTeam.players.map((p: Player) => p.ign).join(', ')}</span></div>
                {createdTeam.substitute && (
                  <div>SUBSTITUTE: <span className="text-orange">{createdTeam.substitute.ign} ({createdTeam.substitute.name})</span></div>
                )}
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
                    university: '',
                    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                    logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                  });
                }}
                variant="ghost"
                size="md"
              >
                ENLIST ANOTHER TEAM
              </Button>
            </div>
          </div>
        ) : (
          /* MULTI-STEP FORM BODY */
          <form onSubmit={handleSubmit} className="bg-card/90 border border-tactical-border p-6 sm:p-10 backdrop-blur-md">
            
            {/* STEP 1: TEAM INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-tactical-border pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                      STEP 1: SQUAD & UNIVERSITY IDENTITY
                    </h3>
                    <p className="text-xs font-mono text-secondaryText">
                      Specify the formal squad designation and collegiate institution.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFillDemo}
                    className="self-start sm:self-center px-3 py-1.5 text-xs font-mono text-cyan hover:text-white bg-surface border border-cyan/40 hover:border-cyan transition-colors"
                  >
                    ⚡ AUTO-FILL SAMPLE SQUAD
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      TEAM NAME <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UWU Cyber Knights"
                      value={teamInfo.name}
                      onChange={(e) => setTeamInfo({ ...teamInfo, name: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                    {errors.teamName && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.teamName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      TEAM TAG (3-6 CHARACTERS) <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UWU.CK"
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
                    COLLEGIATE INSTITUTION / UNIVERSITY <span className="text-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uva Wellassa University of Sri Lanka"
                    value={teamInfo.university}
                    onChange={(e) => setTeamInfo({ ...teamInfo, university: e.target.value })}
                    className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                  />
                  {errors.university && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.university}</p>}
                </div>

                {/* Logo Upload & Preview */}
                <div className="pt-2">
                  <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                    TEAM LOGO (IMAGE UPLOAD OR URL)
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
                        <span className="text-[10px] font-mono text-secondaryText">PNG, JPG, or WEBP</span>
                      </div>

                      <input
                        type="url"
                        placeholder="Or paste external image URL..."
                        value={teamInfo.logo}
                        onChange={(e) => setTeamInfo({ ...teamInfo, logo: e.target.value, logoPreview: e.target.value })}
                        className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CAPTAIN INFORMATION */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-tactical-border pb-4 mb-6">
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                    STEP 2: DESIGNATED CAPTAIN INFORMATION
                  </h3>
                  <p className="text-xs font-mono text-secondaryText">
                    Official liaison responsible for scheduling, map vetoes, and communications with CST admins.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                    CAPTAIN FULL LEGAL NAME <span className="text-cyan">*</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      STUDENT / CONTACT EMAIL <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. kasun.b@std.uwu.ac.lk"
                      value={captainInfo.email}
                      onChange={(e) => setCaptainInfo({ ...captainInfo, email: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                    {errors.capEmail && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.capEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                      PHONE NUMBER / WHATSAPP <span className="text-cyan">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +94 77 123 4567"
                      value={captainInfo.phone}
                      onChange={(e) => setCaptainInfo({ ...captainInfo, phone: e.target.value })}
                      className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                    />
                    {errors.capPhone && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.capPhone}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PLAYER INFORMATION (5 REQUIRED + 1 OPTIONAL SUB) */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="border-b border-tactical-border pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                        STEP 3: 5 ACTIVE PLAYERS + 1 SUBSTITUTE
                      </h3>
                      <p className="text-xs font-mono text-secondaryText">
                        Exact competitive lineup required. All 5 starters must be complete.
                      </p>
                    </div>
                    <Badge variant="cyan" size="sm">5 REQUIRED</Badge>
                  </div>
                </div>

                {/* 5 Main Players */}
                <div className="space-y-6">
                  {players.map((player, idx) => (
                    <div key={idx} className="p-4 bg-surface/50 border border-tactical-border">
                      <div className="flex items-center justify-between mb-3 border-b border-tactical-border/60 pb-2">
                        <span className="text-xs font-mono font-bold text-cyan uppercase">
                          {`PLAYER 0${idx + 1} // ${player.role}`}
                        </span>
                        <span className="text-[10px] font-mono text-secondaryText uppercase">STARTER</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                            FULL NAME *
                          </label>
                          <input
                            type="text"
                            placeholder="Player name"
                            value={player.name}
                            onChange={(e) => {
                              const updated = [...players];
                              updated[idx].name = e.target.value;
                              setPlayers(updated);
                            }}
                            className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                          />
                          {errors[`p_${idx}_name`] && <p className="text-[10px] text-rose-500 mt-0.5">{errors[`p_${idx}_name`]}</p>}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                            IN-GAME NAME (IGN) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Phantom99"
                            value={player.ign}
                            onChange={(e) => {
                              const updated = [...players];
                              updated[idx].ign = e.target.value;
                              setPlayers(updated);
                            }}
                            className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                          />
                          {errors[`p_${idx}_ign`] && <p className="text-[10px] text-rose-500 mt-0.5">{errors[`p_${idx}_ign`]}</p>}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                            STEAM ID / COMMUNITY URL *
                          </label>
                          <input
                            type="text"
                            placeholder="STEAM_0:1:..."
                            value={player.steamId}
                            onChange={(e) => {
                              const updated = [...players];
                              updated[idx].steamId = e.target.value;
                              setPlayers(updated);
                            }}
                            className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                          />
                          {errors[`p_${idx}_steamId`] && <p className="text-[10px] text-rose-500 mt-0.5">{errors[`p_${idx}_steamId`]}</p>}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                            STUDENT EMAIL *
                          </label>
                          <input
                            type="email"
                            placeholder="student@univ.ac.lk"
                            value={player.email}
                            onChange={(e) => {
                              const updated = [...players];
                              updated[idx].email = e.target.value;
                              setPlayers(updated);
                            }}
                            className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                          />
                          {errors[`p_${idx}_email`] && <p className="text-[10px] text-rose-500 mt-0.5">{errors[`p_${idx}_email`]}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Substitute */}
                <div className="p-4 bg-surface/30 border border-dashed border-tactical-border">
                  <div className="flex items-center justify-between mb-3 border-b border-tactical-border/60 pb-2">
                    <span className="text-xs font-mono font-bold text-orange uppercase">
                      DESIGNATED SUBSTITUTE (OPTIONAL 6TH PLAYER)
                    </span>
                    <span className="text-[10px] font-mono text-secondaryText uppercase">OPTIONAL</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        placeholder="Substitute name"
                        value={substitute.name}
                        onChange={(e) => setSubstitute({ ...substitute, name: e.target.value })}
                        className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                        IN-GAME NAME (IGN)
                      </label>
                      <input
                        type="text"
                        placeholder="Substitute IGN"
                        value={substitute.ign}
                        onChange={(e) => setSubstitute({ ...substitute, ign: e.target.value })}
                        className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                        STEAM ID
                      </label>
                      <input
                        type="text"
                        placeholder="STEAM_0:0:..."
                        value={substitute.steamId}
                        onChange={(e) => setSubstitute({ ...substitute, steamId: e.target.value })}
                        className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-secondaryText uppercase mb-1">
                        STUDENT EMAIL
                      </label>
                      <input
                        type="email"
                        placeholder="email@univ.ac.lk"
                        value={substitute.email}
                        onChange={(e) => setSubstitute({ ...substitute, email: e.target.value })}
                        className="w-full bg-surface border border-tactical-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-orange"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW AND SUBMIT */}
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

                {/* Summary Card */}
                <div className="bg-surface/70 border border-tactical-border p-6 font-mono text-xs space-y-6">
                  {/* Team */}
                  <div className="flex items-center gap-4 border-b border-tactical-border pb-4">
                    <div className="relative w-16 h-16 bg-card border border-cyan/40 shrink-0 overflow-hidden">
                      <Image src={teamInfo.logo} alt="Team Logo" fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <span className="text-cyan font-bold">[{teamInfo.tag}]</span>
                      <h4 className="font-display font-black text-xl text-white uppercase">{teamInfo.name}</h4>
                      <p className="text-secondaryText">{teamInfo.university}</p>
                    </div>
                  </div>

                  {/* Captain */}
                  <div className="border-b border-tactical-border pb-4">
                    <span className="text-cyan font-bold block mb-1 uppercase">CAPTAIN DETAILS:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-secondaryText">
                      <div>NAME: <span className="text-white">{captainInfo.name}</span></div>
                      <div>EMAIL: <span className="text-white">{captainInfo.email}</span></div>
                      <div>PHONE: <span className="text-white">{captainInfo.phone}</span></div>
                    </div>
                  </div>

                  {/* 5 Players */}
                  <div>
                    <span className="text-cyan font-bold block mb-2 uppercase">STARTING FIVE ROSTER:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {players.map((p, idx) => (
                        <div key={idx} className="p-2.5 bg-card border border-tactical-border/70 flex justify-between items-center">
                          <div>
                            <span className="text-cyan font-bold mr-1.5">0{idx + 1}.</span>
                            <span className="text-white font-bold">{p.ign}</span>{' '}
                            <span className="text-secondaryText text-[11px]">({p.name})</span>
                          </div>
                          <span className="text-[10px] text-secondaryText">{p.steamId}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Substitute if added */}
                  {substitute.name.trim() && (
                    <div className="pt-2 border-t border-tactical-border">
                      <span className="text-orange font-bold block mb-1 uppercase">SUBSTITUTE:</span>
                      <div className="p-2.5 bg-card border border-tactical-border/70 flex justify-between items-center">
                        <div>
                          <span className="text-orange font-bold mr-1.5">[SUB]</span>
                          <span className="text-white font-bold">{substitute.ign}</span>{' '}
                          <span className="text-secondaryText text-[11px]">({substitute.name})</span>
                        </div>
                        <span className="text-[10px] text-secondaryText">{substitute.steamId}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-card border border-cyan/30 text-[11px] text-secondaryText leading-relaxed">
                    By submitting, the captain certifies that all listed players are officially enrolled university students and agree to comply with Counter-Strike 2 competitive fair-play guidelines.
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
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
                  icon={<Crosshair className="w-5 h-5" />}
                  className="font-black"
                >
                  CONFIRM & TRANSMIT REGISTRATION
                </Button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

