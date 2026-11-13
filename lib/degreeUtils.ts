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
 * Validates strictly that an enrollment number has 4 slash-separated parts:
 * Part 1: Exactly 'UWU'
 * Part 2: Recognized degree code (e.g. CST, IIT, SCT, etc.)
 * Part 3: 2-digit academic batch year (e.g. 20, 21, 22, 23, 24, 25)
 * Part 4: 3-digit or 4-digit student serial number (e.g. 001, 111)
 * Example: UWU/CST/23/111
 */
export function validateStrictEnrollmentFormat(enrollment: string | undefined | null): {
  isValid: boolean;
  error?: string;
  parts?: { uwu: string; degree: string; year: string; serial: string };
} {
  if (!enrollment || typeof enrollment !== 'string') {
    return { isValid: false, error: 'Enrollment number is required' };
  }

  const trimmed = enrollment.trim().toUpperCase();
  const parts = trimmed.split('/');

  if (parts.length !== 4) {
    return {
      isValid: false,
      error: 'Must contain exactly 4 parts separated by slashes (format: UWU/CST/23/111)',
    };
  }

  const [part1, part2, part3, part4] = parts;

  if (part1 !== 'UWU') {
    return {
      isValid: false,
      error: "Part 1 must be exactly 'UWU' (e.g. UWU/CST/23/111)",
    };
  }

  if (!part2 || !DEGREE_REGISTRY[part2]) {
    return {
      isValid: false,
      error: `Part 2 degree '${part2}' is not a recognized UWU degree code (e.g. CST, IIT, SCT, etc.)`,
    };
  }

  if (!/^\d{2}$/.test(part3)) {
    return {
      isValid: false,
      error: `Part 3 year '${part3}' must be a 2-digit batch year (e.g. 22, 23, 24)`,
    };
  }

  if (!part4 || !/^\d+$/.test(part4)) {
    return {
      isValid: false,
      error: `Part 4 student number is required and must be digits (e.g. 1, 11, 111)`,
    };
  }

  return {
    isValid: true,
    parts: { uwu: part1, degree: part2, year: part3, serial: part4 },
  };
}

/**
 * Extracts degree information from an enrollment number string.
 * Strictly verifies the 4-part structure UWU/<DEGREE>/<YEAR>/<NO>.
 */
export function extractDegreeFromEnrollment(enrollment: string | undefined | null): ExtractedDegree | null {
  if (!enrollment || typeof enrollment !== 'string') return null;
  const trimmed = enrollment.trim().toUpperCase();
  if (!trimmed) return null;

  const strictCheck = validateStrictEnrollmentFormat(trimmed);
  if (strictCheck.isValid && strictCheck.parts) {
    const info = DEGREE_REGISTRY[strictCheck.parts.degree];
    if (info) {
      return {
        code: info.code,
        name: info.name,
        faculty: info.faculty,
        normalizedEnrollment: `UWU/${info.code}/${strictCheck.parts.year}/${strictCheck.parts.serial}`,
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

    const strictCheck = validateStrictEnrollmentFormat(en);
    if (!strictCheck.isValid) {
      errors[idx] = `${memberLabel}: ${strictCheck.error || 'Invalid enrollment format. Required: UWU/<DEGREE>/<YEAR>/<NO> (e.g. UWU/CST/23/111)'}`;
      memberDegrees.push(null);
      return;
    }

    const degreeInfo = extractDegreeFromEnrollment(en);
    if (!degreeInfo) {
      errors[idx] = `${memberLabel} enrollment number format is invalid. Required format: UWU/<DEGREE>/<YEAR>/<NO> (e.g. UWU/CST/23/111)`;
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
