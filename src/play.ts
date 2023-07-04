
export interface Player {
    name: string;
    wins: Player[];
    losses: Player[];
    rest: number;
}

export interface MatchResult {
    winner: Player;
    loser?: Player;
    players?: Player[];
    finished: boolean;
}

export interface PlayerStats {
    // player: Player;
    wins: number;
    losses: number;
    matches: number;
}


// pick player with worst score (most losses)
// 1. Pick two player with least matches that havent lost two times

export async function play(
    players: Player[], 
    chooseWinner: (p1: Player, p2: Player) => Promise<Player>
): Promise<MatchResult> {
    const [p1, p2] = pick(players);
    if (!p1 || !p2) {
        if (!p1 && !p2) throw new Error('No winner!?');

        const winner = p1 ? p1! : p2!;
        return {
            winner,
            finished: true
        };
    }
    const winner = await chooseWinner(p1, p2);
    const loser = winner === p1 ? p2 : p1;

    winner.wins.push(loser);
    loser.losses.push(winner);
    
    // update rest
    players.forEach(p => p.rest++);
    winner.rest = 0;
    loser.rest = 0;

    return {
        players: [p1, p2],
        winner,
        loser,
        finished: false,
    };
}

function pick(players: Player[]): Player[] {
    const playersInGroupA = players.filter(p => p.losses.length === 0);
    
    // console.log('A', playersInGroupA.length);
    let sortedPlayers = [...players].sort((a, b) => {
        // todo not the same team if can be avoided

        const aMatchCount = a.wins.length + a.losses.length;
        const bMatchCount = b.wins.length + b.losses.length;

        const aHasLosses = Boolean(a.losses.length);
        const bHasLosses = Boolean(b.losses.length);

        if (playersInGroupA.length > 1) {
            if (aHasLosses && !bHasLosses) return 1;
            if (bHasLosses && !aHasLosses) return -1;
        }

        // least matches
        const matchDiff = aMatchCount - bMatchCount;
        if (matchDiff !== 0) return matchDiff;
        
        const aScore = a.wins.length - a.losses.length;
        const bScore = b.wins.length - b.losses.length;

        const scoreDiff = aScore - bScore;
        if (scoreDiff !== 0) return scoreDiff;

        // most rest
        const restDiff = (b.rest - a.rest);
        if (restDiff !== 0) return restDiff;

        return 0;
    });

    const playersStillIn = sortedPlayers.filter(p => p.losses.length < 2);
    return playersStillIn.slice(0, 2);
}

export function playerStats(players: Player[]): PlayerStats[] {
    return players.map(player => {
        return {
            wins: player.wins.length,
            losses: player.losses.length,
            matches: player.wins.length + player.losses.length,
        }
    })
}