import { assertEquals, assertStrictEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { MatchResult, Player, play } from "./play.ts";

export interface TestPlayer extends Player {
    strength: number;
}

Deno.test("four players", async () => {

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
        results.push(result);
        console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner.name);
    } while (!result.finished);

    /**
      Kent
      Johan
      Alex
      Kent
      Alex
      Kent
      Kent
     */
    assertEquals(results.map(r => r.winner.name), [
        players[0].name, 
        players[3].name, 
        players[1].name, 
        players[0].name,
        players[1].name,
        players[0].name,
        players[0].name
    ]);
});

Deno.test("five players", async () => {

    const players: TestPlayer[] = [
        { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 },
        { name: 'Cronblad', strength: 5, wins: [], losses: [], rest: 0 },
        { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
        { name: 'Jonna', strength: 1, wins: [], losses: [], rest: 0 },
        { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
    ];

    async function chooseWinner(p1: TestPlayer, p2: TestPlayer): Promise<Player> {
        const winner = p1.strength > p2.strength ? p1 : p2;
        return winner;
    }
    
    let results: MatchResult[] = [];
    let result: MatchResult;
    do {
        result = await play(players, chooseWinner as (p1: Player, p2: Player) => Promise<Player>);
        results.push(result);
        console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner.name);
    } while (!result.finished);

    /**
      Kent
      Johan
      Alex
      Kent
      Alex
      Kent
      Kent
     */
    // assertEquals(results.map(r => r.winner), [
    //     players[0], 
    //     players[3], 
    //     players[1], 
    //     players[0],
    //     players[1],
    //     players[0],
    //     players[0]
    // ]);
});
