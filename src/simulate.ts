import { MatchResult, Player, play } from "./play.ts";

export interface TestPlayer extends Player {
    strength: number;
}

const players: TestPlayer[] = [
    { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
    { name: 'Alex', strength: 2, wins: [], losses: [], rest: 0 },
    { name: 'Ledin', strength: 1, wins: [], losses: [], rest: 0 },
    { name: 'Johan', strength: 1.5, wins: [], losses: [], rest: 0 },
];

async function chooseWinner(p1: TestPlayer, p2: TestPlayer): Promise<Player> {
    const winner = p1.strength > p2.strength ? p1 : p2;
    return winner;
}

let results: MatchResult[] = [];
let result: MatchResult;
do {
    result = await play(players, chooseWinner as (p1: Player, p2: Player) => Promise<Player>);
    console.log(result.winner.name);
    results.push(result);
} while (!result.finished);