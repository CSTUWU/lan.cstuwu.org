// Official Degree Programmes and Codes for Uva Wellassa University of Sri Lanka (UWU)

export interface DegreeInfo {
  code: string;
  name: string;
  faculty: string;
}

export const DEGREE_REGISTRY: Record<string, DegreeInfo> = {
  CST: {
    code: 'CST',
    name: 'Computer Science and Technology (CST)',
    faculty: 'Faculty of Applied Sciences',
  },
  IIT: {
    code: 'IIT',
    name: 'Industrial Information Technology (IIT)',
    faculty: 'Faculty of Applied Sciences',
  },
  SCT: {
    code: 'SCT',
    name: 'Science and Technology (SCT)',
    faculty: 'Faculty of Applied Sciences',
  },
  MRT: {
    code: 'MRT',
    name: 'Mineral Resources and Technology (MRT)',
    faculty: 'Faculty of Applied Sciences',
  },
  BICT: {
    code: 'BICT',
    name: 'Information and Communication Technology (BICT)',
    faculty: 'Faculty of Technological Studies',
  },
  ICT: {
    code: 'BICT',
    name: 'Information and Communication Technology (BICT)',
    faculty: 'Faculty of Technological Studies',
  },
  BET: {
    code: 'BET',
    name: 'Engineering Technology (BET)',
    faculty: 'Faculty of Technological Studies',
  },
  ENG: {
    code: 'BET',
    name: 'Engineering Technology (BET)',
    faculty: 'Faculty of Technological Studies',
  },
  BST: {
    code: 'BST',
    name: 'Biosystems Technology (BST)',
    faculty: 'Faculty of Technological Studies',
  },
  ENM: {
    code: 'ENM',
    name: 'Entrepreneurship and Management (ENM)',
    faculty: 'Faculty of Management',
  },
  HTE: {
    code: 'HTE',
    name: 'Hospitality, Tourism and Events Management (HTE)',
    faculty: 'Faculty of Management',
  },
  HRD: {
    code: 'HRD',
    name: 'Human Resource Development (HRD)',
    faculty: 'Faculty of Management',
  },
  ANS: {
    code: 'ANS',
    name: 'Animal Science (ANS)',
    faculty: 'Faculty of Animal Science and Export Agriculture',
  },
  AQT: {
    code: 'AQT',
    name: 'Aquatic Resources Technology (AQT)',
    faculty: 'Faculty of Animal Science and Export Agriculture',
  },
  EAG: {
    code: 'EAG',
    name: 'Export Agriculture (EAG)',
    faculty: 'Faculty of Animal Science and Export Agriculture',
  },
  PMT: {
    code: 'PMT',
    name: 'Plantation Management Technology (PMT)',
    faculty: 'Faculty of Animal Science and Export Agriculture',
  },
  TEA: {
    code: 'PMT',
    name: 'Plantation Management Technology (PMT)',
    faculty: 'Faculty of Animal Science and Export Agriculture',
  },
  ELAL: {
    code: 'ELAL',
    name: 'English Language & Applied Linguistics (ELAL)',
    faculty: 'Faculty of Management',
  },
  MBBS: {
    code: 'MBBS',
    name: 'Bachelor of Medicine and Bachelor of Surgery (MBBS)',
    faculty: 'Faculty of Medicine',
  },
};

export interface ExtractedDegree {
  code: string;
  name: string;
  faculty: string;
  normalizedEnrollment: string;
}

/**
 * Extracts degree information from an enrollment number string.
 * Supports formats like:
 * - UWU/CST/22/001
 * - UWU-CST-22-001
 * - UWU CST 22 001
 * - CST/22/001
 * - CST 22 001
 */
export function extractDegreeFromEnrollment(enrollment: string | undefined | null): ExtractedDegree | null {
  if (!enrollment || typeof enrollment !== 'string') return null;
  const trimmed = enrollment.trim().toUpperCase();
  if (!trimmed) return null;

  // 1. Primary Regex: UWU/CST/22/001 or CST/22/001 or UWU-CST-22-001 or UWU/CST/2022/045
  const standardMatch = trimmed.match(/(?:UWU[/\s\-_]?)?([A-Z]{2,5})[/\s\-_]?(\d{2,4})[/\s\-_]?(\d{1,4})/);
  if (standardMatch) {
    const rawCode = standardMatch[1];
    const year = standardMatch[2];
    const num = standardMatch[3];
    const info = DEGREE_REGISTRY[rawCode];
    if (info) {
      return {
        code: info.code,
        name: info.name,
        faculty: info.faculty,
        normalizedEnrollment: `UWU/${info.code}/${year.slice(-2)}/${num.padStart(3, '0')}`,
      };
    }
  }

  // 2. Secondary check: search for known degree codes
  for (const [codeKey, info] of Object.entries(DEGREE_REGISTRY)) {
    const regex = new RegExp(`(^|[^A-Z])${codeKey}([^A-Z]|$)`);
    if (regex.test(trimmed)) {
      return {
        code: info.code,
        name: info.name,
        faculty: info.faculty,
        normalizedEnrollment: trimmed.replace(/\s+/g, '/'),
      };
    }
  }

  // 3. Fallback: split parts
  const parts = trimmed.replace(/[^A-Z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const candidate = parts[0] === 'UWU' ? parts[1] : parts[0];
    if (candidate && DEGREE_REGISTRY[candidate]) {
      const info = DEGREE_REGISTRY[candidate];
      return {
        code: info.code,
        name: info.name,
        faculty: info.faculty,
        normalizedEnrollment: trimmed,
      };
    }
  }

  return null;
}

export function getDegreeCodeFromName(degreeName: string | undefined | null): string | null {
  if (!degreeName) return null;
  const upper = degreeName.toUpperCase();
  for (const [code, info] of Object.entries(DEGREE_REGISTRY)) {
    if (code === upper || info.name.toUpperCase().includes(upper) || upper.includes(code)) {
      return info.code;
    }
  }
  return null;
}

export interface SquadDegreeValidationResult {
  isValid: boolean;
  degreeCode: string | null;
  degreeName: string | null;
  faculty: string | null;
  errors: Record<number, string>;
  generalError: string | null;
  memberDegrees: Array<ExtractedDegree | null>;
}

/**
 * Validates that all members of a squad belong to the same degree programme
 * identified by their individual enrollment numbers.
 */
export function validateSquadEnrollmentDegrees(
  enrollmentNumbers: string[],
  expectedDegreeCodeOrName?: string
): SquadDegreeValidationResult {
  const errors: Record<number, string> = {};
  const memberDegrees: Array<ExtractedDegree | null> = [];

  let expectedCode: string | null = null;
  if (expectedDegreeCodeOrName) {
    expectedCode = getDegreeCodeFromName(expectedDegreeCodeOrName);
  }

  enrollmentNumbers.forEach((en, idx) => {
    const memberLabel = idx === 0 ? 'Member 1 (Team Leader)' : `Member ${idx + 1}`;
    if (!en || !en.trim()) {
      errors[idx] = `${memberLabel} enrollment number is required (e.g. UWU/CST/22/001)`;
      memberDegrees.push(null);
      return;
    }

    const degreeInfo = extractDegreeFromEnrollment(en);
    if (!degreeInfo) {
      errors[idx] = `${memberLabel} enrollment number format is invalid. Degree cannot be identified. Use format: UWU/<DEGREE>/<YEAR>/<NO> (e.g. UWU/CST/22/001)`;
      memberDegrees.push(null);
      return;
    }

    memberDegrees.push(degreeInfo);

    // If expectedCode was not set from team degree, anchor to Member 1 (Leader)
    if (!expectedCode && idx === 0) {
      expectedCode = degreeInfo.code;
    }
  });

  // Verify all members match the expected degree code
  if (expectedCode) {
    const expectedInfo = DEGREE_REGISTRY[expectedCode];
    const expectedName = expectedInfo ? expectedInfo.name : expectedCode;

    memberDegrees.forEach((deg, idx) => {
      if (deg && deg.code !== expectedCode) {
        const memberLabel = idx === 0 ? 'Member 1 (Team Leader)' : `Member ${idx + 1}`;
        errors[idx] = `Degree mismatch: ${memberLabel} has degree '${deg.code}' (${deg.name}), but squad degree is '${expectedCode}' (${expectedName}). Every team member must belong to the same degree programme.`;
      }
    });
  }

  const distinctCodes = Array.from(new Set(memberDegrees.filter(Boolean).map((d) => d!.code)));
  let generalError: string | null = null;
  if (distinctCodes.length > 1) {
    generalError = `All team members must belong to the same degree programme. Detected multiple degrees from enrollment numbers: ${distinctCodes.join(', ')}.`;
  }

  const isValid = Object.keys(errors).length === 0 && distinctCodes.length === 1;
  const primaryInfo = distinctCodes.length === 1 ? DEGREE_REGISTRY[distinctCodes[0]] : null;

  return {
    isValid,
    degreeCode: primaryInfo ? primaryInfo.code : null,
    degreeName: primaryInfo ? primaryInfo.name : null,
    faculty: primaryInfo ? primaryInfo.faculty : null,
    errors,
    generalError,
    memberDegrees,
  };
}
