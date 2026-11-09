import { Team } from './types';

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).trim();
  // Escape quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`;
}

function triggerDownload(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  // \uFEFF is the UTF-8 BOM so Microsoft Excel opens it correctly with UTF-8 encoding
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Excel Sheet: Master List of All Operatives / Members
 * Every row represents an individual student athlete.
 */
export function downloadAllMembersExcel(teams: Team[], customFilename?: string) {
  const headers = [
    '#',
    'Team Name',
    'Team Tag',
    'Role',
    'Member Full Name',
    'Gaming Name (IGN)',
    'Academic Year',
    'Enrollment Number',
    'Degree Programme',
    'WhatsApp Contact',
    'Email Address',
    'Registration Status',
    'Registration Reference',
    'Submission Timestamp',
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeCsvCell).join(','));

  let rowCounter = 1;

  teams.forEach((team) => {
    const leaderEnrollment = team.captain?.enrollmentNumber || team.enrollmentNumber || team.column1 || '';
    const teamDegree = team.degreeProgram || team.faculty || 'Computer Science and Technology (CST)';
    const teamEmail = team.email || team.captain?.email || '';
    const teamWhatsApp = team.captain?.whatsappNumber || team.captain?.phone || '';
    const formattedDate = team.createdAt ? new Date(team.createdAt).toLocaleString() : '';

    (team.players || []).forEach((player, pIdx) => {
      const isLeader = pIdx === 0 || player.role === 'Team Leader';
      const role = isLeader ? 'Member 1 (Team Leader)' : `Member ${pIdx + 1}`;
      const fullName = player.name || (isLeader ? team.captain?.name : '') || '';
      const ign = player.gamingName || player.ign || (isLeader ? (team.captain?.gamingName || team.captain?.ign) : '') || '';
      const year = player.year ? `Year ${player.year}` : (team.year ? `Year ${team.year}` : 'Year 1');
      const enrollmentNo = player.enrollmentNumber || (isLeader ? leaderEnrollment : '') || '';

      const row = [
        rowCounter++,
        team.name,
        team.tag,
        role,
        fullName,
        ign,
        year,
        enrollmentNo,
        teamDegree,
        teamWhatsApp,
        teamEmail,
        (team.status || 'pending').toUpperCase(),
        team.id,
        formattedDate,
      ];

      rows.push(row.map(escapeCsvCell).join(','));
    });
  });

  const csvContent = rows.join('\r\n');
  const filename = customFilename || `CST_LAN_Challenge_2026_All_Members_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(csvContent, filename);
}

/**
 * Export Excel Sheet: Team-Wise Grouped Dossier
 * Grouped clearly by Squad with dedicated roster rows beneath each squad.
 */
export function downloadTeamWiseExcel(teams: Team[], customFilename?: string) {
  const rows: string[] = [];

  // Title Banner
  rows.push(['CST LAN CHALLENGE 2026 - TOURNAMENT SQUAD & OPERATIVE ROSTER DOSSIER'].map(escapeCsvCell).join(','));
  rows.push(['Computer Science and Technology Degree Programme - Uva Wellassa University of Sri Lanka'].map(escapeCsvCell).join(','));
  rows.push([`Exported on: ${new Date().toLocaleString()}`].map(escapeCsvCell).join(','));
  rows.push([''].map(escapeCsvCell).join(',')); // Blank line

  teams.forEach((team, tIdx) => {
    const leaderEnrollment = team.captain?.enrollmentNumber || team.enrollmentNumber || team.column1 || '';
    const teamDegree = team.degreeProgram || team.faculty || 'Computer Science and Technology (CST)';
    const teamEmail = team.email || team.captain?.email || '';
    const teamWhatsApp = team.captain?.whatsappNumber || team.captain?.phone || '';
    const formattedDate = team.createdAt ? new Date(team.createdAt).toLocaleString() : '';

    // Team Header Block
    rows.push([
      `SQUAD 0${tIdx + 1}: [${team.tag}] ${team.name}`,
      `STATUS: ${(team.status || 'pending').toUpperCase()}`,
      `DEGREE: ${teamDegree}`,
      `WHATSAPP: ${teamWhatsApp}`,
      `EMAIL: ${teamEmail}`,
      `REF: ${team.id}`,
      `DATE: ${formattedDate}`,
    ].map(escapeCsvCell).join(','));

    // Sub-table header for members
    rows.push([
      'Slot',
      'Role',
      'Member Full Name',
      'Gaming Name (IGN)',
      'Academic Year',
      'Enrollment Number',
      'Degree Programme',
    ].map(escapeCsvCell).join(','));

    // 5 Operatives
    (team.players || []).forEach((player, pIdx) => {
      const isLeader = pIdx === 0 || player.role === 'Team Leader';
      const role = isLeader ? 'Team Leader // Captain' : `Operative 0${pIdx + 1}`;
      const fullName = player.name || (isLeader ? team.captain?.name : '') || '';
      const ign = player.gamingName || player.ign || (isLeader ? (team.captain?.gamingName || team.captain?.ign) : '') || '';
      const year = player.year ? `Year ${player.year}` : (team.year ? `Year ${team.year}` : 'Year 1');
      const enrollmentNo = player.enrollmentNumber || (isLeader ? leaderEnrollment : '') || '';

      rows.push([
        `Slot 0${pIdx + 1}`,
        role,
        fullName,
        ign,
        year,
        enrollmentNo,
        teamDegree,
      ].map(escapeCsvCell).join(','));
    });

    // Blank separator line between squads
    rows.push(['', '', '', '', '', '', ''].map(escapeCsvCell).join(','));
  });

  const csvContent = rows.join('\r\n');
  const filename = customFilename || `CST_LAN_Challenge_2026_Team_Wise_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(csvContent, filename);
}

