import { assertEquals, assertStrictEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { MatchResult, Player, play, playerStats, writePlayerStats } from "./play.ts";

export interface TestPlayer extends Player {
    strength: number;
}

Deno.test("undecided winner", async () => {

    const players: TestPlayer[] = [
        { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
        { name: 'Alex', strength: 2, wins: [], losses: [], rest: 0 },
        { name: 'Ledin', strength: 1, wins: [], losses: [], rest: 0 },
        { name: 'Johan', strength: 1.5, wins: [], losses: [], rest: 0 },
    ];

    const result = await play(players, async (p1, p2) => undefined);

    assertEquals(result, {
        winner: undefined,
        loser: undefined,
        players: [players[0], players[1]],
        finished: false,
    });
    assertEquals(players[0].isPlaying, true);
    assertEquals(players[1].isPlaying, true);
});

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
        console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner?.name);
    } while (!result.finished);

    assertEquals(results.map(r => r.winner?.name), [
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
        console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner?.name);
    } while (!result.finished);
    console.log(results.length - 1);

    writePlayerStats(players);

    // Alexander  2 2 4
    // Cronblad   4 0 4
    // Kent       2 2 4
    // Jonna      0 2 2
    // Viktoria   0 2 2

    assertEquals(results[results.length - 1].winner?.name, players[1].name);
    assertEquals(playerStats(players), [{
            wins: 1,
            losses: 2,
            matches: 3
        },
        {
            losses: 0,
            matches: 5,
            wins: 5,
        },
        {
            losses: 2,
            matches: 4,
            wins: 2,
        },
        {
            losses: 2,
            matches: 2,
            wins: 0,
        },
        {
            losses: 2,
            matches: 2,
            wins: 0,
        }
    ]);
});


Deno.test("eight players", async () => {

    const players: TestPlayer[] = [
        { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
        { name: 'Totte', strength: 8, wins: [], losses: [], rest: 0 },
        { name: 'Jonna', strength: 1.5, wins: [], losses: [], rest: 0 },
        { name: 'Cronblad', strength: 6, wins: [], losses: [], rest: 0 },
        { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 },
        { name: 'Palten', strength: 5, wins: [], losses: [], rest: 0 },
        { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
        { name: 'Hilda', strength: 1, wins: [], losses: [], rest: 0 },
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
        console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner?.name);
    } while (!result.finished);

    writePlayerStats(players);

    // Alexander  2 2 4
    // Cronblad   4 0 4
    // Kent       2 2 4
    // Jonna      0 2 2
    // Viktoria   0 2 2

    assertEquals(results[results.length - 1].winner?.name, players[1].name);
    assertEquals(players.filter(p => p.losses.length < 2), [players[1]]);
    // assertEquals(playerStats(players), [{
    //         wins: 2,
    //         losses: 2,
    //         matches: 4
    //     },
    //     {
    //         losses: 0,
    //         matches: 4,
    //         wins: 4,
    //     },
    //     {
    //         losses: 2,
    //         matches: 4,
    //         wins: 2,
    //     },
    //     {
    //         losses: 2,
    //         matches: 2,
    //         wins: 0,
    //     },
    //     {
    //         losses: 2,
    //         matches: 2,
    //         wins: 0,
    //     }
    // ]);
});
