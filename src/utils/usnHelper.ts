/**
 * Utility to parse and validate Srinivas Institute of Technology (SIT) VTU USN numbers.
 * Format: 4SN<YY><BRANCH><XXX> (e.g., 4SN22CS045)
 */

export interface ParsedUSN {
  isValid: boolean;
  isSIT: boolean;
  collegeCode: string;
  collegeName: string;
  joiningYear?: number;
  estimatedSemester?: number;
  branchCode?: string;
  branchName?: string;
  rollNumber?: string;
  formattedUSN: string;
}

const SIT_BRANCH_MAP: Record<string, string> = {
  CS: 'Computer Science & Engineering',
  IS: 'Information Science & Engineering',
  AI: 'Artificial Intelligence & Data Science',
  AD: 'Artificial Intelligence & Data Science',
  EC: 'Electronics & Communication Engineering',
  EE: 'Electrical & Electronics Engineering',
  ME: 'Mechanical Engineering',
  CV: 'Civil Engineering',
  AE: 'Aeronautical Engineering',
  AU: 'Automobile Engineering',
  MC: 'Master of Computer Applications',
  MB: 'Master of Business Administration',
};

export function parseSITUSN(rawUSN: string): ParsedUSN {
  const clean = rawUSN.trim().toUpperCase().replace(/\s+/g, '');

  if (!clean) {
    return {
      isValid: false,
      isSIT: false,
      collegeCode: '',
      collegeName: 'Srinivas Institute of Technology, Mangalore',
      formattedUSN: '',
    };
  }

  // Check SIT pattern: starts with 4SN or at least partial match
  const isSIT = clean.startsWith('4SN');

  // Regex pattern for full VTU USN: e.g. 4SN22CS045
  const match = clean.match(/^4SN(\d{2})([A-Z]{2})(\d{2,3})$/);

  if (match) {
    const yearDigits = parseInt(match[1], 10);
    const branchCode = match[2];
    const rollNumber = match[3];

    const currentYear = new Date().getFullYear();
    const joiningYear = 2000 + yearDigits;
    const yearsDiff = currentYear - joiningYear;
    const currentMonth = new Date().getMonth();
    const isOddSem = currentMonth >= 7 || currentMonth <= 1;
    let estimatedSemester = Math.max(1, Math.min(8, yearsDiff * 2 + (isOddSem ? 1 : 2)));
    if (estimatedSemester > 8) estimatedSemester = 8;

    const branchName = SIT_BRANCH_MAP[branchCode] || `${branchCode} Engineering`;

    return {
      isValid: true,
      isSIT: true,
      collegeCode: '4SN',
      collegeName: 'Srinivas Institute of Technology, Mangalore',
      joiningYear,
      estimatedSemester,
      branchCode,
      branchName,
      rollNumber,
      formattedUSN: clean,
    };
  }

  // Partial match detection for real-time feedback
  const partialMatch = clean.match(/^4SN(\d{0,2})([A-Z]{0,2})(\d{0,3})$/);
  if (partialMatch && partialMatch[2] && SIT_BRANCH_MAP[partialMatch[2]]) {
    const branchCode = partialMatch[2];
    return {
      isValid: false,
      isSIT: true,
      collegeCode: '4SN',
      collegeName: 'Srinivas Institute of Technology, Mangalore',
      branchCode,
      branchName: SIT_BRANCH_MAP[branchCode],
      formattedUSN: clean,
    };
  }

  return {
    isValid: clean.length >= 8,
    isSIT,
    collegeCode: isSIT ? '4SN' : '',
    collegeName: 'Srinivas Institute of Technology, Mangalore',
    formattedUSN: clean,
  };
}
