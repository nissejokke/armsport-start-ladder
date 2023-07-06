
export interface Player {
    name: string;
    wins: Player[];
    losses: Player[];
    rest: number;
    isPlaying?: boolean;
}

export interface MatchResult {
    winner?: Player;
    loser?: Player;
    players?: Player[];
    finished: boolean;
}

export interface PlayerStats {
    wins: number;
    losses: number;
    matches: number;
}

export async function play(
    players: Player[], 
    chooseWinner: (p1: Player, p2: Player) => Promise<Player | undefined>
): Promise<MatchResult> {
    const p1 = pick(players);
    if (!p1) throw new Error('No winner!?');
    // console.log('->', p1.name)
    const p2 = pick(players, p1);

    if (!p2) {
        const winner = p1;
        return {
            winner,
            finished: true
        };
    }
    
    p1.isPlaying = true;
    p2.isPlaying = true;

    const winner = await chooseWinner(p1, p2);
    let loser: Player | undefined;
    if (winner === p1)
        loser = p2;
    else if (winner === p2)
        loser = p1;
    else
        loser = undefined;

    if (winner && loser) {
        winner.isPlaying = false;
        loser.isPlaying = false;

        winner.wins.push(loser);
        loser.losses.push(winner);
    
        // update rest
        players.forEach(p => p.rest++);
        winner.rest = 0;
        loser.rest = 0;
    }

    return {
        players: [p1, p2],
        winner,
        loser,
        finished: false,
    };
}

export function playersNotPlaying(players: Player[]): Player[] {
    return players.filter(player => !player.isPlaying);
}

function pick(players: Player[], versus?: Player): Player {
    // const playersInGroupA = players.filter(p => p.losses.length === 0).length;
    const playersWithNoMatch = players.filter(p => p.wins.length + p.losses.length === 0).length;
    const debug = false;

    let winnerGroup: boolean | undefined = undefined;
    if (playersWithNoMatch) {
        winnerGroup = true;
    }

    // console.log('A', playersInGroupA.length);
    let sortedPlayers = [...players]
        .filter(p => !p.isPlaying)
        .filter(p => versus ? p !== versus : true)
        .filter(p => {
            if (winnerGroup === true)
                return p.losses.length === 0;
            if (winnerGroup === false)
                return p.losses.length > 0;
            return true;
        })
        .sort((a, b) => {
        // todo not the same team if can be avoided
        
        if (playersWithNoMatch) {
            // console.log('*', a.name, b.name)
        }
        const aMatchCount = a.wins.length + a.losses.length;
        const bMatchCount = b.wins.length + b.losses.length;

        const aHasLosses = Boolean(a.losses.length);
        const bHasLosses = Boolean(b.losses.length);
        
        // least matches
        const matchDiff = aMatchCount - bMatchCount;
        if (matchDiff !== 0) {
            if (debug) console.log('=', matchDiff, '(matches)');
            return matchDiff;
        }
        
        // if (playersInGroupA.length > 0) {
        //     if (restDiff !== 0) return restDiff;
        // }

        // if (playersInGroupA.length > 0) {
        //     console.log('*', a.name, b.name);
        //     if (aMatchCount === 0) {
        //         if (!bHasLosses) return 1;
        //     }
        //     if (bMatchCount === 0) {
        //         if (!aHasLosses) return -1;
        //     }
        // }

        const aScore = a.wins.length - a.losses.length;
        const bScore = b.wins.length - b.losses.length;
        const scoreDiff = aScore - bScore;

        // if (versus) {
        //     if (versus.wins.length + versus.losses.length === 0) {
        //         const lossDiff = a.losses.length - b.losses.length;
        //         if (lossDiff !== 0) {
        //             if (debug) console.log('=', lossDiff, '(loss)');
        //             return lossDiff;
        //         }
        //     }
        // }

        // lowest score
        if (scoreDiff !== 0) {
            if (debug) console.log('=', scoreDiff, '(score)');
            return scoreDiff;
        }

        // most rest
        const restDiff = (b.rest - a.rest);
        if (restDiff !== 0) {
            if (debug) console.log('=', restDiff, '(rest)');
            return restDiff;
        }

        // const winsDiff = b.wins.length - a.wins.length
        // if (winsDiff !== 0) return winsDiff;
        if (debug) console.log('=0');
        return 0;
    });

    const playersStillIn = sortedPlayers.filter(p => p.losses.length < 2);
    return playersStillIn.slice(0, 1)[0];
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