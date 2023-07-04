
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


// pick player with worst score (most losses)
// 1. Pick two player with least matches that havent lost two times

export async function play(
    players: Player[], 
    chooseWinner: (p1: Player, p2: Player) => Promise<Player>
): Promise<MatchResult> {
    const [p1, p2] = pick(players);
    if (!p1 || !p2) {
        if (!p1 && !p2) throw new Error('No winner!?');
        // console.log('Winner', p1 ? p1.name : p2.name);
        const winner = p1 ? p1! : p2!;
        return {
            winner,
            finished: true
        };
    }
    const winner = await chooseWinner(p1, p2);
    const loser = winner === p1 ? p2 : p1;
    // console.log(p1.name + ' vs ' + p2.name + ', winner', winner.name);
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
    const existsPlayersWithNoMatches = players
        .map(p => p.wins.length + p.losses.length)
        .some(count => count === 0);
    
    // console.log(existsPlayersWithNoMatches);
    let sortedPlayers = [...players].sort((a, b) => {
        // todo not the same team if can be avoided

        const aMatchCount = a.wins.length + a.losses.length;
        const bMatchCount = b.wins.length + b.losses.length;

        const aHasLosses = Boolean(a.losses.length);
        const bHasLosses = Boolean(b.losses.length);

        // if (existsPlayersWithNoMatches) {
        //     if (aHasLosses && !bHasLosses) return 1;
        //     if (bHasLosses && !aHasLosses) return -1;
        // }
        // if (a.name === 'Viktoria') {
        //     console.log(b.name, b.wins.length, b.losses.length)
        // }
        
        // least matches
        const matchDiff = aMatchCount - bMatchCount;
        if (matchDiff !== 0) return matchDiff;
        

        // if (aHasLosses && !bHasLosses) return 1;
        // if (!aHasLosses && bHasLosses) return -1;
        // if (playersWithNoMatches) {
            // most wins
            // const winsDiff = b.wins.length - a.wins.length;
            // if (winsDiff !== 0) return winsDiff;
        //     if (!aHasLosses && bHasLosses) return -1;
        //     if (aHasLosses && !bHasLosses) return 1;
        // }

        
        // if (a.name === 'Viktoria') {
            //     console.log(a);
            // }
            // if (b.name === 'Viktoria') {
                //     console.log(b);
                // }
                // const aMatches = a.wins.length + a.losses.length;
                // if (aMatches === 0 && b.wins.length) return 1;
                // const bMatches = b.wins.length + b.losses.length;
                // if (bMatches === 0 && a.wins.length) return -1;
                
        const aScore = a.wins.length - a.losses.length;
        const bScore = b.wins.length - b.losses.length;

        // if (existsPlayersWithNoMatches) {
        //     const scoreDiff = bScore - aScore;
        //     if (scoreDiff !== 0) return scoreDiff;
        // }
        // else {
            // worst score
            const scoreDiff = aScore - bScore;
            if (scoreDiff !== 0) return scoreDiff;
        // }

        // most rest
        // const restDiff = (b.rest - a.rest);
        // if (restDiff !== 0) return restDiff;


        return 0;
    });
    // if (existsPlayersWithNoMatches) {
    //     sortedPlayers = sortedPlayers.filter(p => p.losses.length === 0);
    //     console.log('yes')
    // }

    const playersStillIn = sortedPlayers.filter(p => p.losses.length < 2);
    return playersStillIn.slice(0, 2);
}