'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getLiveBroadcastChannel } from '@/lib/storage';
import { Team, Player, Captain, UWU_DEGREE_PROGRAMMES, ACADEMIC_YEARS } from '@/lib/types';
import {
  extractDegreeFromEnrollment,
  getDegreeCodeFromName,
  validateSquadEnrollmentDegrees,
} from '@/lib/degreeUtils';
import {
  Shield,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  Crosshair,
  Loader2,
  Phone,
  GraduationCap,
  Lock,
  Calendar,
  Mail,
  Hash,
  Clock,
  Sparkles,
  FileCode2,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

interface RegistrationFormState {
  teamName: string;
  teamTag: string;
  logo: string;
  logoPreview: string;
  logoFile: File | null;
  degreeProgram: string;
  email: string;
  whatsappNumber: string;
}

interface MemberFormState {
  fullName: string;
  gamingName: string;
  year: string; // 1, 2, 3, 4
  enrollmentNumber: string; // Member's unique Enrollment Number e.g. UWU/CST/22/001
  configFile?: File | null;
  configFileName?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { isOpen } = useRegistrationStatus();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string>('');

  // Step 1: Team & Academic Cohort Information
  const [form, setForm] = useState<RegistrationFormState>({
    teamName: '',
    teamTag: '',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    logoFile: null,
    degreeProgram: 'Computer Science and Technology (CST)',
    email: '',
    whatsappNumber: '',
  });

  // Step 2: 5 Squad Members (all from same Degree Programme, each with individual Academic Year and Enrollment Number)
  const [members, setMembers] = useState<MemberFormState[]>([
    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' }, // Member 1 (Team Leader)
    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' }, // Member 2
    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' }, // Member 3
    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' }, // Member 4
    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' }, // Member 5
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image upload handling
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, logoFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm((prev) => ({
          ...prev,
          logo: result,
          logoPreview: result,
          logoFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemberChange = (index: number, field: keyof MemberFormState, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Auto-sync team degree programme when Leader (Member 1) types a recognized enrollment number
    if (index === 0 && field === 'enrollmentNumber') {
      const identified = extractDegreeFromEnrollment(value);
      if (identified && identified.name) {
        setForm((prev) => ({
          ...prev,
          degreeProgram: identified.name,
        }));
      }
    }
  };

  const handleMemberConfigFile = (index: number, file: File | null) => {
    if (file) {
      if (!file.name.toLowerCase().endsWith('.cfg')) {
        setErrors((prev) => ({
          ...prev,
          [`m_${index}_cfg`]: 'Only .cfg files are allowed',
        }));
        return;
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`m_${index}_cfg`];
        return next;
      });
      setMembers((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], configFile: file, configFileName: file.name };
        return updated;
      });
    } else {
      setMembers((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], configFile: null, configFileName: '' };
        return updated;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.teamName.trim()) newErrors.teamName = 'Team name is required';
      if (!form.teamTag.trim()) {
        newErrors.teamTag = 'Team tag (e.g. CST.A) is required';
      } else if (form.teamTag.trim().length < 2 || form.teamTag.trim().length > 10) {
        newErrors.teamTag = 'Team tag must be 2 to 10 characters';
      }

      if (!form.degreeProgram.trim()) newErrors.degreeProgram = 'Select your Degree Programme';

      if (!form.email.trim()) {
        newErrors.email = 'Contact email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        newErrors.email = 'Valid email address required (e.g. operative@std.uwu.ac.lk)';
      }

      const cleanWa = form.whatsappNumber.replace(/[\s\-\+]/g, '');
      if (!cleanWa || cleanWa.length < 9) {
        newErrors.whatsappNumber = 'Valid WhatsApp contact number required (e.g. 0771234567)';
      }
    }

    if (step === 2) {
      members.forEach((m, idx) => {
        const memberNum = idx + 1;
        const roleLabel = idx === 0 ? 'Member 1 (Team Leader)' : `Member ${memberNum}`;
        if (!m.fullName.trim()) {
          newErrors[`m_${idx}_fullName`] = `${roleLabel} full name is required`;
        }
        if (!m.gamingName.trim()) {
          newErrors[`m_${idx}_gamingName`] = `${roleLabel} in game name (Callsign) is required`;
        }
        if (!m.year || !m.year.trim()) {
          newErrors[`m_${idx}_year`] = `${roleLabel} year is required`;
        }
        if (!m.enrollmentNumber || !m.enrollmentNumber.trim()) {
          newErrors[`m_${idx}_enrollmentNumber`] = `${roleLabel} enrollment number (e.g. UWU/CST/22/001) is required`;
        }
      });

      // Strict same-degree validation: identify degree from enrollment numbers
      const enrollmentNumbers = members.map((m) => m.enrollmentNumber.trim());
      const degreeValidation = validateSquadEnrollmentDegrees(enrollmentNumbers, form.degreeProgram);

      if (!degreeValidation.isValid) {
        Object.entries(degreeValidation.errors).forEach(([idxStr, err]) => {
          newErrors[`m_${idxStr}_enrollmentNumber`] = err;
        });
        if (degreeValidation.generalError) {
          setApiError(degreeValidation.generalError);
        }
      } else if (degreeValidation.degreeName) {
        // All 5 members verified from the same degree! Ensure team degree is in sync
        setForm((prev) => ({ ...prev, degreeProgram: degreeValidation.degreeName! }));
        setApiError(null);
      }
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

    if (!validateStep(1) || !validateStep(2)) {
      alert('Please fill out all required team and member fields.');
      return;
    }

    // Strict verification that all 5 members share the same degree programme via enrollment numbers
    const enrollmentNumbers = members.map((m) => m.enrollmentNumber.trim());
    const degreeValidation = validateSquadEnrollmentDegrees(enrollmentNumbers, form.degreeProgram);
    if (!degreeValidation.isValid) {
      setApiError(
        degreeValidation.generalError ||
          Object.values(degreeValidation.errors)[0] ||
          'All squad members must belong to the same degree programme identified from their enrollment numbers.'
      );
      setIsSubmitting(false);
      return;
    }

    const verifiedDegree = degreeValidation.degreeName || form.degreeProgram;
    const verifiedFaculty = degreeValidation.faculty || 'Faculty of Applied Sciences';

    setIsSubmitting(true);
    const nowIso = new Date().toISOString();
    setSubmissionTimestamp(nowIso);

    // Build exactly 5 squad players (all under team's verified single Degree Programme)
    const rosterPlayers: Player[] = members.map((m, idx) => ({
      id: String(idx + 1),
      name: m.fullName.trim(),
      faculty: verifiedFaculty,
      degreeProgram: verifiedDegree,
      year: m.year,
      ign: m.gamingName.trim(),
      gamingName: m.gamingName.trim(),
      steamId: '',
      email: idx === 0 ? form.email.trim() : '',
      role: idx === 0 ? 'Team Leader' : `Operative 0${idx + 1}`,
      enrollmentNumber: m.enrollmentNumber.trim().toUpperCase(),
    }));

    const captainInfo: Captain = {
      name: members[0].fullName.trim(),
      whatsappNumber: form.whatsappNumber.trim(),
      phone: form.whatsappNumber.trim(),
      faculty: verifiedFaculty,
      degreeProgram: verifiedDegree,
      year: members[0].year,
      enrollmentNumber: members[0].enrollmentNumber.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      ign: members[0].gamingName.trim(),
      gamingName: members[0].gamingName.trim(),
    };

    // Payload formatted for backend API submission
    const backendPayload = {
      teamName: form.teamName.trim(),
      teamTag: form.teamTag.trim().toUpperCase(),
      university: 'Uva Wellassa University of Sri Lanka',
      degreeProgram: verifiedDegree,
      year: members[0].year,
      enrollmentNumber: members[0].enrollmentNumber.trim().toUpperCase(),
      column1: members[0].enrollmentNumber.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      teamLogo: form.logo,
      captain: captainInfo,
      players: rosterPlayers.map((p, idx) => ({
        fullName: p.name,
        faculty: form.degreeProgram,
        year: p.year || members[idx]?.year || '1',
        inGameName: p.ign || '',
        gamingName: p.gamingName || p.ign || '',
        steamId: '',
        email: p.email || '',
        role: p.role || 'PLAYER',
        enrollmentNumber: p.enrollmentNumber || members[idx].enrollmentNumber.trim(),
      })),
    };

    try {
      let res;
      if (form.logoFile) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(backendPayload));
        formData.append('logo', form.logoFile);
        res = await api.registrations.submit(formData);
      } else {
        res = await api.registrations.submit(backendPayload);
      }

      const confirmationId =
        res?.data?.registrationNumber ||
        res?.data?.confirmationCode ||
        `REG-2026-${Date.now().toString(36).toUpperCase()}`;

      const teamObj: Team = {
        id: confirmationId,
        name: res?.data?.teamName || form.teamName.trim(),
        tag: res?.data?.teamTag || form.teamTag.trim().toUpperCase(),
        university: 'Uva Wellassa University of Sri Lanka',
        logo: form.logo,
        status: (res?.data?.status || 'pending').toLowerCase() as any,
        createdAt: res?.data?.createdAt || nowIso,
        captain: captainInfo,
        players: rosterPlayers,
        degreeProgram: verifiedDegree,
        year: members[0].year,
        enrollmentNumber: members[0].enrollmentNumber.trim().toUpperCase(),
        column1: members[0].enrollmentNumber.trim().toUpperCase(),
        email: form.email.trim(),
      };

      setCreatedTeam(teamObj);
      setIsSubmitted(true);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Backend registration submission failed:', err);
      if (err.errors && err.errors.length > 0) {
        const filtered = err.errors.filter((e: any) => !e.message?.toLowerCase().includes('steam'));
        if (filtered.length > 0) {
          setApiError(filtered.map((e: any) => e.message).join(' | '));
        } else {
          setApiError(null);
        }
      } else if (!err.message?.toLowerCase().includes('steam')) {
        setApiError(err.message || 'Registration failed. Could not establish communication with tournament database.');
      } else {
        setApiError(null);
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'TEAM & ACADEMIC COHORT' },
    { num: 2, label: '5 OPERATIVE ROSTER' },
    { num: 3, label: 'CONFIRM TRANSMISSION' },
  ];

  if (!isOpen) {
    return (
      <div className="pt-28 pb-24 bg-military-black min-h-screen">
        <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki mb-8">
            <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-tacticalWhite">ENLISTMENT PORTAL</span>
          </div>

          <div className="relative bg-card/95 border-2 border-rose-800/60 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.85)]">
            <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-rose-500" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-rose-500" />
            <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-rose-500" />
            <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-rose-500" />

            <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-700/50 flex items-center justify-center mx-auto mb-6 text-rose-400">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-950/40 border border-rose-700/50 text-rose-300 text-xs font-mono uppercase tracking-widest font-bold mb-4">
              <span>ADMINISTRATIVE GATE // CLOSED</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-tacticalWhite tracking-tight mb-3">
              REGISTRATIONS ARE CURRENTLY <span className="text-rose-400">CLOSED</span>
            </h1>

            <p className="text-xs sm:text-sm font-mono text-mutedKhaki leading-relaxed max-w-lg mx-auto mb-8">
              Official squad submissions for CST LAN Challenge 2026 have concluded. The tournament brackets and live stage fixtures are now active.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/teams" variant="olive" size="md" icon={<Users className="w-4 h-4" />}>
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
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki mb-8">
          <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-tacticalWhite">ENLISTMENT PORTAL</span>
        </div>

        {/* Institution Banner - University locked to UWU */}
        <div className="bg-surface/90 border border-gunmetal p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-olive/20 border border-olive flex items-center justify-center shrink-0 text-sand">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-tacticalWhite font-bold block">
                UVA WELLASSA UNIVERSITY OF SRI LANKA // OFFICIAL ENLISTMENT
              </span>
              <span className="text-mutedKhaki text-[11px]">
                Exclusively for Registered Students of Uva Wellassa University of Sri Lanka (UWU)
              </span>
            </div>
          </div>
          <span className="text-sand font-bold px-2.5 py-1 bg-surface border border-gunmetal text-[10px] uppercase shrink-0">
            5V5 S&amp;D COD4 TOURNAMENT
          </span>
        </div>

        <div className="border-b border-gunmetal pb-8 mb-10">
          <Badge variant="olive" size="sm" className="mb-2">
            OFFICIAL TEAM ENLISTMENT DOSSIER
          </Badge>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-tacticalWhite tracking-tight">
            SQUAD <span className="text-sand">REGISTRATION</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-mutedKhaki mt-1">
            Organized by the <strong className="text-tacticalWhite">Computer Science and Technology Degree Programme</strong>, Faculty of Applied Sciences, Uva Wellassa University.
          </p>
        </div>

        {!isSubmitted && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10">
            {steps.map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`p-3 text-center border font-mono text-xs transition-colors clip-tactical ${
                    isCurrent
                      ? 'bg-olive/20 border-olive text-sand font-bold shadow-[0_2px_10px_rgba(24,30,24,0.6)]'
                      : isPassed
                      ? 'bg-surface/60 border-gunmetal text-sand'
                      : 'bg-card/40 border-gunmetal text-mutedKhaki/60'
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
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {isSubmitted && createdTeam ? (
          <div className="bg-card border border-gunmetal p-8 sm:p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-olive/20 border border-olive rounded-full flex items-center justify-center mx-auto mb-6 text-sand">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <Badge variant="olive" size="md" className="mb-4">
              ENLISTMENT RECORDED IN TOURNAMENT REGISTRY
            </Badge>

            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-tacticalWhite tracking-wider mb-2">
              SQUAD ENLISTMENT SUCCESSFUL
            </h2>

            <p className="text-xs sm:text-sm font-mono text-mutedKhaki max-w-lg mx-auto mb-8">
              Your registration for <strong className="text-tacticalWhite">{createdTeam.name} [{createdTeam.tag}]</strong> has been recorded under reference code: <span className="text-sand font-bold">{createdTeam.id}</span>. Status: <span className="text-sand font-bold">PENDING ADMINISTRATIVE APPROVAL</span>.
            </p>

            <div className="bg-surface/80 border border-gunmetal p-6 max-w-xl mx-auto text-left font-mono text-xs mb-8">
              <div className="flex items-center gap-4 border-b border-gunmetal pb-4 mb-4">
                <div className="relative w-14 h-14 bg-card border border-gunmetal overflow-hidden shrink-0">
                  <Image src={createdTeam.logo} alt={createdTeam.name} fill className="object-cover" sizes="56px" />
                </div>
                <div>
                  <div className="text-sand font-bold text-base">{createdTeam.name} [{createdTeam.tag}]</div>
                  <div className="text-tacticalWhite">{createdTeam.degreeProgram}</div>
                  <div className="text-mutedKhaki text-[11px]">Uva Wellassa University of Sri Lanka</div>
                </div>
              </div>

              <div className="space-y-2.5 text-mutedKhaki">
                <div className="flex items-center gap-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-sand" />
                  <span>TIMESTAMP: <strong className="text-tacticalWhite">{new Date(submissionTimestamp || createdTeam.createdAt).toLocaleString()}</strong></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gunmetal">
                  <div>
                    <span className="text-sand font-bold block">EMAIL ADDRESS:</span>
                    <span className="text-tacticalWhite">{createdTeam.email || createdTeam.captain.email}</span>
                  </div>
                  <div>
                    <span className="text-sand font-bold block">WHATSAPP NUMBER:</span>
                    <span className="text-emerald-400 font-bold">{createdTeam.captain.whatsappNumber}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-sand font-bold block">DEGREE PROGRAMME (SHARED BY SQUAD):</span>
                    <span className="text-tacticalWhite font-bold">{createdTeam.degreeProgram}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gunmetal">
                  <span className="text-sand font-bold block mb-2 uppercase">5-MEMBER SQUAD ROSTER (INDIVIDUAL ENROLLMENT NUMBERS):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {createdTeam.players.map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-card border border-gunmetal text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sand font-bold">
                            {idx === 0 ? 'Member 1 (Leader)' : `Member ${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-mutedKhaki bg-surface px-1.5 py-0.2 border border-gunmetal">
                            IGN: <strong className="text-sand">{p.ign || p.gamingName || '—'}</strong>
                          </span>
                        </div>
                        <div className="text-tacticalWhite font-medium truncate">{p.name}</div>
                        <div className="text-[10px] text-mutedKhaki font-mono mt-1.5 flex items-center justify-between border-t border-gunmetal/50 pt-1">
                          <span>Year: <strong className="text-sand">Year {p.year || '1'}</strong></span>
                          <span>ENROLLMENT: <strong className="text-tacticalWhite">{p.enrollmentNumber || '—'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/teams" variant="olive" size="md">
                VIEW REGISTERED SQUADS
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setForm({
                    teamName: '',
                    teamTag: '',
                    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                    logoPreview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
                    logoFile: null,
                    degreeProgram: 'Computer Science and Technology (CST)',
                    email: '',
                    whatsappNumber: '',
                  });
                  setMembers([
                    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '' },
                    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '' },
                    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '' },
                    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '' },
                    { fullName: '', gamingName: '', year: '1', enrollmentNumber: '' },
                  ]);
                }}
                variant="ghost"
                size="md"
              >
                ENLIST ANOTHER SQUAD
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/90 border border-gunmetal p-6 sm:p-10 backdrop-blur-md">
            
            {/* STEP 1: TEAM IDENTITY & ACADEMIC COHORT */}
            {currentStep === 1 && (
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
                        setForm({ ...form, teamName: name, teamTag: form.teamTag ? form.teamTag : suggestedTag });
                      }}
                      className="w-full bg-surface border border-gunmetal px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
                    />
                    {errors.teamName && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.teamName}</p>}
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
                      onChange={(e) => setForm({ ...form, teamTag: e.target.value.toUpperCase() })}
                      className="w-full bg-surface border border-gunmetal px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive uppercase"
                    />
                    {errors.teamTag && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.teamTag}</p>}
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
                    onChange={(e) => setForm({ ...form, degreeProgram: e.target.value })}
                    className="w-full bg-surface border border-gunmetal px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
                  >
                    {UWU_DEGREE_PROGRAMMES.map((deg) => (
                      <option key={deg} value={deg} className="bg-military-black text-tacticalWhite">
                        {deg}
                      </option>
                    ))}
                  </select>
                  {errors.degreeProgram && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.degreeProgram}</p>}
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
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-surface border border-gunmetal px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
                    />
                    {errors.email && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WHATSAPP NUMBER <span className="text-sand">*</span></span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0771234567"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      className="w-full bg-surface border border-gunmetal px-4 py-2.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
                    />
                    {errors.whatsappNumber && <p className="text-[11px] font-mono text-rose-500 mt-1">{errors.whatsappNumber}</p>}
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

                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-surface border border-gunmetal hover:border-sand text-xs font-mono text-tacticalWhite transition-colors">
                          <Upload className="w-3.5 h-3.5 text-sand" />
                          <span>UPLOAD LOGO IMAGE</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <span className="text-[10px] font-mono text-mutedKhaki">PNG, JPG, or WEBP (Max 5MB)</span>
                      </div>

                      <input
                        type="url"
                        placeholder="Or paste external image URL..."
                        value={form.logo}
                        onChange={(e) => setForm({ ...form, logo: e.target.value, logoPreview: e.target.value })}
                        className="w-full bg-surface border border-gunmetal px-3 py-1.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: 5 SQUAD MEMBERS (MEMBERS 1 - 5) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-gunmetal pb-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-tacticalWhite uppercase tracking-wider">
                        STEP 2: 5 SQUAD MEMBERS (NAME, IN GAME NAME, YEAR &amp; ENROLLMENT NUMBER)
                      </h3>
                      <p className="text-xs font-mono text-mutedKhaki mt-1">
                        All 5 operatives must belong to <strong className="text-sand">{form.degreeProgram}</strong>. Degree is identified directly from each member&apos;s individual enrollment number.
                      </p>
                    </div>
                    <Badge variant="olive" size="sm">5 ATHLETES REQUIRED</Badge>
                  </div>
                </div>

                {/* Prominent Same-Degree Eligibility Requirement Banner */}
                <div className="p-4 bg-olive/15 border border-olive/60 clip-tactical flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-sand shrink-0 mt-0.5" />
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-sand font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
                      <span>OFFICIAL ELIGIBILITY MANDATE: SAME DEGREE REQUIREMENT</span>
                      {(() => {
                        const code = getDegreeCodeFromName(form.degreeProgram);
                        return code ? (
                          <span className="px-2 py-0.5 bg-surface border border-gunmetal text-sand font-bold text-[10px]">
                            DEGREE CODE: {code}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-tacticalWhite/90 leading-relaxed text-[11px]">
                      Tournament regulations dictate that every squad member must belong to the <strong className="text-sand">same Degree Programme</strong>. The system automatically identifies each operative&apos;s degree using their enrolment number (e.g. <span className="text-sand font-bold">UWU/{getDegreeCodeFromName(form.degreeProgram) || 'CST'}/22/001</span>).
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

                        {/* Balanced 2x2 Field Grid with Uniform Alignment & Heights */}
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
                              onChange={(e) => handleMemberChange(idx, 'fullName', e.target.value)}
                              className="h-10 w-full bg-surface border border-gunmetal px-3.5 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive transition-colors"
                            />
                            {errors[`m_${idx}_fullName`] && (
                              <p className="text-[10px] font-mono text-rose-500 mt-1">{errors[`m_${idx}_fullName`]}</p>
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
                              placeholder={isLeader ? 'e.g. V3CT0R_99' : `e.g. GHOST_0${idx + 1}`}
                              value={member.gamingName}
                              onChange={(e) => handleMemberChange(idx, 'gamingName', e.target.value)}
                              className="h-10 w-full bg-surface border border-gunmetal px-3.5 text-xs font-mono text-sand font-bold focus:outline-none focus:border-olive transition-colors"
                            />
                            {errors[`m_${idx}_gamingName`] && (
                              <p className="text-[10px] font-mono text-rose-500 mt-1">{errors[`m_${idx}_gamingName`]}</p>
                            )}
                          </div>

                          {/* 3. Academic Year */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                              <span className="font-bold flex items-center gap-1">
                                ACADEMIC YEAR <span className="text-sand">*</span>
                              </span>
                              <span className="text-[10px] text-sand font-mono bg-card px-1.5 py-0.2 border border-gunmetal">
                                YEAR (1, 2, 3, 4)
                              </span>
                            </div>
                            <select
                              value={member.year}
                              onChange={(e) => handleMemberChange(idx, 'year', e.target.value)}
                              className="h-10 w-full bg-surface border border-gunmetal px-3.5 text-xs font-mono text-sand font-bold focus:outline-none focus:border-olive transition-colors"
                            >
                              {ACADEMIC_YEARS.map((y) => (
                                <option key={y} value={y} className="bg-military-black text-tacticalWhite">
                                  Year {y} ({y === '1' ? '1st Year' : y === '2' ? '2nd Year' : y === '3' ? '3rd Year' : '4th Year'})
                                </option>
                              ))}
                            </select>
                            {errors[`m_${idx}_year`] && (
                              <p className="text-[10px] font-mono text-rose-500 mt-1">{errors[`m_${idx}_year`]}</p>
                            )}
                          </div>

                          {/* 4. Individual Enrollment Number & Real-Time Degree Detection */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-mono text-mutedKhaki uppercase mb-1.5 h-5">
                              <span className="font-bold flex items-center gap-1">
                                ENROLLMENT NUMBER <span className="text-sand">*</span>
                              </span>
                              <span className="text-[10px] text-sand font-mono bg-card px-1.5 py-0.2 border border-gunmetal">
                                IDENTIFIES DEGREE
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder={isLeader ? 'e.g. UWU/CST/21/045' : `e.g. UWU/CST/22/00${idx + 1}`}
                              value={member.enrollmentNumber}
                              onChange={(e) => handleMemberChange(idx, 'enrollmentNumber', e.target.value)}
                              className="h-10 w-full bg-surface border border-gunmetal px-3.5 text-xs font-mono text-sand font-bold focus:outline-none focus:border-olive uppercase transition-colors"
                            />

                            {/* Real-Time Live Degree Feedback */}
                            {(() => {
                              const val = member.enrollmentNumber.trim();
                              if (!val) {
                                return (
                                  <p className="text-[10px] font-mono text-mutedKhaki mt-1">
                                    Format: UWU/&lt;DEGREE&gt;/&lt;YEAR&gt;/&lt;NO&gt; (e.g. UWU/{getDegreeCodeFromName(form.degreeProgram) || 'CST'}/22/00{idx + 1})
                                  </p>
                                );
                              }
                              const deg = extractDegreeFromEnrollment(val);
                              const expectedCode = getDegreeCodeFromName(form.degreeProgram);
                              if (!deg) {
                                return (
                                  <p className="text-[10px] font-mono text-amber-400 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    <span>Unrecognized format. Enter official UWU enrollment number (e.g. UWU/CST/22/001)</span>
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
                              <p className="text-[10px] font-mono text-rose-500 mt-1">{errors[`m_${idx}_enrollmentNumber`]}</p>
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
                                    handleMemberConfigFile(idx, file);
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
                                    onClick={() => handleMemberConfigFile(idx, null)}
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
            )}

            {/* STEP 3: REVIEW & CONFIRM TRANSMISSION */}
            {currentStep === 3 && (
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
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 bg-olive/30 border border-olive text-sand text-[10px] uppercase font-bold">
                                LEADER
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                            <span className="text-sand font-bold">
                              Year {m.year}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-mutedKhaki text-[11px]">ENROLLMENT:</span>
                              <span className="px-2 py-0.5 bg-surface border border-gunmetal text-tacticalWhite font-bold flex items-center gap-1.5">
                                <span>{m.enrollmentNumber}</span>
                                {(() => {
                                  const d = extractDegreeFromEnrollment(m.enrollmentNumber);
                                  return d ? (
                                    <span className="px-1.5 py-0.2 bg-olive/30 text-sand text-[9px] font-bold border border-olive/50">
                                      {d.code}
                                    </span>
                                  ) : null;
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-mutedKhaki text-[11px]">IGN:</span>
                              <span className="px-2 py-0.5 bg-surface border border-gunmetal text-sand font-bold">
                                {m.gamingName}
                              </span>
                            </div>
                            {m.configFileName && (
                              <div className="flex items-center gap-1 text-[11px] text-sand bg-surface border border-olive/40 px-2 py-0.5">
                                <FileCode2 className="w-3 h-3 text-sand" />
                                <span className="font-bold">{m.configFileName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-card border border-gunmetal text-[11px] text-mutedKhaki leading-relaxed">
                    By confirming, the squad leader certifies that all 5 operatives are officially registered students of Uva Wellassa University representing the indicated degree programme and agree to competitive LAN guidelines.
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-gunmetal flex items-center justify-between">
              {currentStep > 1 ? (
                <Button type="button" onClick={handleBack} variant="ghost" size="md" icon={<ChevronLeft className="w-4 h-4" />}>
                  BACK
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  variant="olive"
                  size="md"
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  CONTINUE TO STEP 0{currentStep + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="olive"
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
