
export interface SettledMatchName {
    winner: string;
    loser: string;
}

export interface Competition {
    id: string;
    created: string;
    playerNames: string[];
    settledMatchNames: SettledMatchName[];
}

export function newCompetition(competition: Competition) {
    saveCompetitions([competition]);
}

export function updateCompetition(id: string, competition: Competition) {
    const index = getCompetitionIndex(id);
    if (index === -1) throw new Error(`Competition with id ${id} doesn't exist`);
    const competitions = getCompetitions();
    competitions[index] = competition;
    saveCompetitions(competitions);
}

export function getCompetition(id: string): Competition | undefined {
    const index = getCompetitionIndex(id);
    if (index === -1) return undefined;
    const competitions = getCompetitions();
    return competitions[index];
}

function getCompetitionIndex(id: string): number {
    const competitions = getCompetitions();
    const index = competitions.findIndex(c => c.id === id);
    return index;
}

function getCompetitions(): Competition[] {
    const competitions = JSON.parse(localStorage.getItem('competitions') ?? '[]');
    return competitions;
}

function saveCompetitions(competitions: Competition[]) {
    // TODO: Handle full local storage when multiple stored competitions
    // could remove oldest until free space
    localStorage.setItem('competitions', JSON.stringify(competitions));
}