'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getLiveBroadcastChannel, getStoredTeams, setStoredTeams } from '@/lib/storage';
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
import Breadcrumb from '@/components/ui/Breadcrumb';
import PageHeader from '@/components/ui/PageHeader';
import TeamLogoAvatar from '@/components/ui/TeamLogoAvatar';
import NoticeAlert from '@/components/ui/NoticeAlert';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import RegistrationClosedCard from '@/components/registration/RegistrationClosedCard';
import RegistrationSuccessCard from '@/components/registration/RegistrationSuccessCard';
import StepProgressBar from '@/components/registration/StepProgressBar';
import Step1TeamIdentity, { Step1FormData } from '@/components/registration/Step1TeamIdentity';
import Step2MemberRoster, { MemberFormState } from '@/components/registration/Step2MemberRoster';
import Step3ReviewConfirm from '@/components/registration/Step3ReviewConfirm';

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
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [`m_${index}_cfg`]: 'Player config file must be 2MB or less',
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

      // Strict duplicate enrollment number check across squad members
      const seenEnrollments = new Map<string, number>();
      members.forEach((m, idx) => {
        const en = m.enrollmentNumber.trim().toUpperCase();
        if (en) {
          if (seenEnrollments.has(en)) {
            const firstIdx = seenEnrollments.get(en)!;
            const firstRole = firstIdx === 0 ? 'Member 1 (Leader)' : `Member ${firstIdx + 1}`;
            newErrors[`m_${idx}_enrollmentNumber`] = `Duplicate enrollment number! Already assigned to ${firstRole}. Each operative must have a unique student number.`;
          } else {
            seenEnrollments.set(en, idx);
          }
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setApiError(null);

    // Strictly ensure submission ONLY happens on Step 3
    if (currentStep !== 3) {
      console.warn('Blocked submit because currentStep is not 3. Current step:', currentStep);
      return;
    }

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
      configFile: m.configFileName ? { filename: m.configFileName } : undefined,
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
        faculty: verifiedFaculty,
        degreeProgram: verifiedDegree,
        year: p.year || members[idx]?.year || '1',
        inGameName: p.ign || '',
        gamingName: p.gamingName || p.ign || '',
        steamId: '',
        email: p.email || (idx === 0 ? form.email.trim() : ''),
        role: p.role || (idx === 0 ? 'Team Leader' : `Operative 0${idx + 1}`),
        enrollmentNumber: p.enrollmentNumber || members[idx].enrollmentNumber.trim().toUpperCase(),
        configFile: p.configFile,
      })),
    };

    try {
      const hasConfigFiles = members.some((m) => !!m.configFile);
      let res;
      if (form.logoFile || hasConfigFiles) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(backendPayload));
        if (form.logoFile) {
          formData.append('logo', form.logoFile);
        }
        members.forEach((m, idx) => {
          if (m.configFile) {
            formData.append(`config_${idx}`, m.configFile);
          }
        });
        res = await api.registrations.submit(formData);
      } else {
        res = await api.registrations.submit(backendPayload);
      }

      const confirmationId =
        res?.data?.registrationNumber ||
        res?.data?.confirmationCode ||
        `REG-2026-${Date.now().toString(36).toUpperCase()}`;

      const savedPlayers: Player[] = Array.isArray(res?.data?.players) && res.data.players.length === 5
        ? res.data.players.map((p: any, idx: number) => ({
            id: p._id || p.id || String(idx + 1),
            name: p.fullName || p.name || rosterPlayers[idx].name,
            faculty: p.faculty || verifiedFaculty,
            degreeProgram: p.degreeProgram || verifiedDegree,
            year: p.year ? String(p.year) : rosterPlayers[idx].year,
            ign: p.gamingName || p.inGameName || p.ign || rosterPlayers[idx].ign,
            gamingName: p.gamingName || p.inGameName || p.ign || rosterPlayers[idx].gamingName,
            steamId: p.steamId || '',
            email: p.email || rosterPlayers[idx].email,
            role: p.role || rosterPlayers[idx].role,
            enrollmentNumber: p.enrollmentNumber ? String(p.enrollmentNumber).toUpperCase() : rosterPlayers[idx].enrollmentNumber,
          }))
        : rosterPlayers;

      const teamObj: Team = {
        id: confirmationId,
        name: res?.data?.teamName || form.teamName.trim(),
        tag: res?.data?.teamTag || form.teamTag.trim().toUpperCase(),
        university: res?.data?.university || 'Uva Wellassa University of Sri Lanka',
        logo: res?.data?.teamLogo || form.logo,
        status: (res?.data?.status || 'pending').toLowerCase() as any,
        createdAt: res?.data?.createdAt || nowIso,
        captain: {
          ...captainInfo,
          name: res?.data?.captain?.name || captainInfo.name,
          whatsappNumber: res?.data?.captain?.whatsappNumber || captainInfo.whatsappNumber,
          phone: res?.data?.captain?.phone || captainInfo.phone,
          gamingName: res?.data?.captain?.gamingName || captainInfo.gamingName,
          ign: res?.data?.captain?.inGameName || captainInfo.ign,
          enrollmentNumber: res?.data?.captain?.enrollmentNumber || captainInfo.enrollmentNumber,
          year: res?.data?.captain?.year ? String(res.data.captain.year) : captainInfo.year,
        },
        players: savedPlayers,
        degreeProgram: res?.data?.degreeProgram || verifiedDegree,
        year: res?.data?.year ? String(res.data.year) : members[0].year,
        enrollmentNumber: res?.data?.enrollmentNumber || members[0].enrollmentNumber.trim().toUpperCase(),
        column1: res?.data?.enrollmentNumber || members[0].enrollmentNumber.trim().toUpperCase(),
        email: res?.data?.email || form.email.trim(),
      };

      try {
        const existing = getStoredTeams();
        const updated = [teamObj, ...existing.filter((t) => t.id !== confirmationId && t.tag !== teamObj.tag)];
        setStoredTeams(updated);
      } catch (storageErr) {
        console.warn('Could not update localStorage team roster:', storageErr);
      }

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
          <Breadcrumb crumbs={[{ label: 'HOME', href: '/' }, { label: 'ENLISTMENT PORTAL' }]} />
          <RegistrationClosedCard />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Breadcrumb crumbs={[{ label: 'HOME', href: '/' }, { label: 'ENLISTMENT PORTAL' }]} />

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
          <StepProgressBar steps={steps} currentStep={currentStep} />
        )}

        <NoticeAlert message={apiError} variant="error" onClose={() => setApiError(null)} className="mb-8" />

        {isSubmitted && createdTeam ? (
          <RegistrationSuccessCard
            createdTeam={createdTeam}
            submissionTimestamp={submissionTimestamp}
            onReset={() => {
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
                { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' },
                { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' },
                { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' },
                { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' },
                { fullName: '', gamingName: '', year: '1', enrollmentNumber: '', configFile: null, configFileName: '' },
              ]);
            }}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 3) {
                handleSubmit(e);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT') {
                  e.preventDefault();
                }
              }
            }}
            className="bg-card/90 border border-gunmetal p-6 sm:p-10 backdrop-blur-md"
          >
            
            {/* STEP 1: TEAM IDENTITY & ACADEMIC COHORT */}
            {currentStep === 1 && (
              <Step1TeamIdentity
                form={form}
                errors={errors}
                onChange={(updates) => setForm({ ...form, ...updates })}
                onLogoFileSelect={handleLogoUpload}
              />
            )}

            {/* STEP 2: 5 SQUAD MEMBERS (MEMBERS 1 - 5) */}
            {currentStep === 2 && (
              <Step2MemberRoster
                members={members}
                degreeProgram={form.degreeProgram}
                errors={errors}
                onMemberChange={handleMemberChange}
                onMemberConfigFile={handleMemberConfigFile}
              />
            )}

            {/* STEP 3: REVIEW & CONFIRM TRANSMISSION */}
            {currentStep === 3 && (
              <Step3ReviewConfirm form={form} members={members} />
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

              {currentStep < 3 && (
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
              )}

              {currentStep === 3 && (
                <Button
                  type="button"
                  onClick={() => handleSubmit()}
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
