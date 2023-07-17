import { assertEquals, assertStrictEquals, assertNotEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { MatchResult, Player, play, playerStats, writePlayerStats } from "./play.ts";
import { Competition } from "./store.ts";

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

    // writePlayerStats(players);

    //            w  l  #
    // Alexander  3  2  5
    // Cronblad   4  0  4
    // Kent       1  2  3
    // Jonna      0  2  2
    // Viktoria   0  2  2

    assertEquals(results[results.length - 1].winner?.name, players[1].name);
    assertEquals(playerStats(players), [{
            wins: 3,
            losses: 2,
            matches: 5
        },
        {
            losses: 0,
            matches: 4,
            wins: 4,
        },
        {
            losses: 2,
            matches: 3,
            wins: 1,
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

    // writePlayerStats(players);

    assertEquals(results[results.length - 1].winner?.name, players[1].name);
    assertEquals(players.filter(p => p.losses.length < 2), [players[1]]);
});


Deno.test("five players, losers should meet other loser and winner should meet other winners firstly", async () => {

    const players: TestPlayer[] = [
        { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 },
        { name: 'Cronblad', strength: 5, wins: [], losses: [], rest: 0 },
        { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
        { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
        { name: 'Jonna', strength: 1, wins: [], losses: [], rest: 0 },
    ];

    const settledMatches: { winner: Player, loser: Player }[] = [];
    settledMatches.push({ winner: players[1], loser: players[0] });
    settledMatches.push({ winner: players[3], loser: players[2] });
    settledMatches.push({ winner: players[1], loser: players[4] });
    settledMatches.push({ winner: players[0], loser: players[2] });
    settledMatches.push({ winner: players[0], loser: players[4] });
    settledMatches.push({ winner: players[1], loser: players[3] });
    settledMatches.push({ winner: players[0], loser: players[3] });
    settledMatches.push({ winner: players[1], loser: players[0] });

    let wi = 0;
    async function chooseWinner(p1: Player, p2: Player): Promise<Player | undefined> {
        if (wi < settledMatches.length)
            return settledMatches[wi++].winner;
        return undefined;
    }

    let results: MatchResult[] = [];
    let result: MatchResult;
    for (let i = 0; i < 5; i++) {
        result = await play(players, chooseWinner);
        results.push(result);
        // console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner?.name);
    }
    
    // Jonna should meet Alex, both from loser group and not Kent from winner group
    assertEquals(result!.players![0].name, players[4].name);
    assertEquals(result!.players![1].name, players[0].name);
    
    result = await play(players, chooseWinner);
    // Kent should meet Cronblad from winner group 
    assertEquals(result!.players![0].name, players[3].name);
    assertEquals(result!.players![1].name, players[1].name);
    
    result = await play(players, chooseWinner);
    // Kent Alex
    assertEquals(result!.players![0].name, players[3].name);
    assertEquals(result!.players![1].name, players[0].name);
    
    result = await play(players, chooseWinner);
    // Cronblad Alex
    assertEquals(result!.players![0].name, players[1].name);
    assertEquals(result!.players![1].name, players[0].name);
    assertEquals(result!.winner?.name, players[1].name);

    // console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner?.name);

});

Deno.test("loser group should finish first", async () => {
    // scenario where Kent is undefeated but is meeting from loser group which is not finished

    const competition: Competition = 
        {
          "id": "1",
          "created": "2023-07-14T09:34:22.912Z",
          "playerNames": [
            "Alex",
            "Cronblad",
            "Viktoria",
            "Kent Andersson",
            "Jonna"
          ],
          "settledMatchNames": [
            {
              "winner": "Cronblad",
              "loser": "Alex"
            },
            {
              "winner": "Kent Andersson",
              "loser": "Viktoria"
            },
            {
              "winner": "Cronblad",
              "loser": "Jonna"
            },
            {
              "winner": "Alex",
              "loser": "Viktoria"
            },
            {
              "winner": "Kent Andersson",
              "loser": "Cronblad"
            },
            {
              "winner": "Alex",
              "loser": "Jonna"
            }
          ]
        };

    const players = [...competition.playerNames].map(name => ({
        name: name,
        wins: [],
        losses: [],
        rest: 0
    }));
    let settledMatches = competition.settledMatchNames.map(settledMatchName => {
        const winner = players.find(p => p.name === settledMatchName.winner);
        if (!winner) throw new Error(`Save state invalid, cannot find player with name ${settledMatchName.winner}`);
        const loser = players.find(p => p.name === settledMatchName.loser);
        if (!loser) throw new Error(`Save state invalid, cannot find player with name ${settledMatchName.loser}`);

        return {
            winner,
            loser
        };
    });

    let wi = 0;
    async function chooseWinner(p1: Player, p2: Player): Promise<Player | undefined> {
        const p1Winner = settledMatches.find(sm => sm.winner === p1 && sm.loser === p2);
        if (p1Winner) {
            const lenBefore = settledMatches.length;
            settledMatches = settledMatches.filter(sm => sm !== p1Winner);
            if (lenBefore - 1 !== settledMatches.length) throw new Error('Should only remove one settled match');
            return p1;
        }
        const p2Winner = settledMatches.find(sm => sm.winner === p2 && sm.loser === p1);
        if (p2Winner) {
            const lenBefore = settledMatches.length;
            settledMatches = settledMatches.filter(sm => sm !== p2Winner);
            if (lenBefore - 1 !== settledMatches.length) throw new Error('Should only remove one settled match');
            return p2;
        }
    }

    let result: MatchResult;
    for (let i = 0; i < 7; i++) {
        result = await play(players, chooseWinner);
        // console.log(result.players?.[0].name, 'vs', result.players?.[1].name, '=>', result.winner?.name);
    }

    assertNotEquals(result!.players![0].name, 'Kent Andersson');
    assertNotEquals(result!.players![1].name, 'Kent Andersson');
});
