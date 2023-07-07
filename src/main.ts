import { buildAndDrawTrees } from "./build-and-draw-tree";
import { MatchResult, Player, play, playersNotPlaying, writePlayerStats } from "./play";
import { TestPlayer } from "./play_test";

interface SettledMatch {
    winner: Player;
    loser: Player;
}

export interface InitLadderArgs {
}

export async function initLadder(args: InitLadderArgs) {
   
    const players: TestPlayer[] = [
        { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
        { name: 'Totte', strength: 8, wins: [], losses: [], rest: 0 },
        { name: 'Jonna', strength: 1.5, wins: [], losses: [], rest: 0 },
        { name: 'Cronblad', strength: 6, wins: [], losses: [], rest: 0 },
        { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 }, // 4
        { name: 'Palten', strength: 5, wins: [], losses: [], rest: 0 },
        { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
        { name: 'Hilda', strength: 1, wins: [], losses: [], rest: 0 },
    ];
    // const players: TestPlayer[] = [
    //     { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 },
    //     { name: 'Cronblad', strength: 5, wins: [], losses: [], rest: 0 },
    //     { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
    //     { name: 'Jonna', strength: 1, wins: [], losses: [], rest: 0 },
    //     { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
    // ];

    // const players: TestPlayer[] = [
    //     { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
    //     { name: 'Alex', strength: 2, wins: [], losses: [], rest: 0 },
    //     { name: 'Ledin', strength: 1, wins: [], losses: [], rest: 0 },
    //     { name: 'Johan', strength: 1.5, wins: [], losses: [], rest: 0 },
    // ];

    
    // async (p1, p2) => players.indexOf(p1) < players.indexOf(p2) ? p1 : p2
    
    // const names = [
    //     'Kent',
    //     'Alex',
    //     'Johan',
    //     'Ledin'
    // ];
    // const players: Player[] = names.map(name => ({ name, wins: [], losses: [], rest: 0 }));
 
    let shuffledPlayers = [...players] as Player[]; //shuffle(players);
    const settledMatches: SettledMatch[] = [];
    // await playBuildAndDraw(shuffledPlayers, settledMatches);
    
    // await new Promise(r => { setTimeout(r, 1000); });
    shuffledPlayers = [...players].map(p => ({
        name: p.name,
        wins: [],
        losses: [],
        rest: 0
    }));
    settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[0] });
    settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[2] });
    settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[5] });
    settledMatches.push({ winner: shuffledPlayers[6], loser: shuffledPlayers[7] });
    settledMatches.push({ winner: shuffledPlayers[5], loser: shuffledPlayers[7] });
    settledMatches.push({ winner: shuffledPlayers[0], loser: shuffledPlayers[2] });
    settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[3] });
    settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[6] });
    // settledMatches.push({ winner: shuffledPlayers[5], loser: shuffledPlayers[0] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[6] });
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[4] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[5] });
    // settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[1] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[1] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[4] });

    await playBuildAndDraw(shuffledPlayers, settledMatches);

    writePlayerStats(shuffledPlayers);
}

async function playBuildAndDraw(players: Player[], settledMatches: SettledMatch[]) {
    // prepare html stuff
    const ladder = document.querySelector('#ladder')!;
    while (ladder.childNodes.length)
        ladder.removeChild(ladder.childNodes[0]);
    const ctx = createCanvas(ladder);

    let settledMatchesPool = [...settledMatches];

    async function determineWinner(p1: Player, p2: Player): Promise<Player | undefined> {
        const p1Winner = settledMatchesPool.find(sm => sm.winner === p1 && sm.loser === p2);
        if (p1Winner) {
            const lenBefore = settledMatchesPool.length;
            settledMatchesPool = settledMatchesPool.filter(sm => sm !== p1Winner);
            if (lenBefore - 1 !== settledMatchesPool.length) throw new Error('Should only remove one settled match');
            return p1;
        }
        const p2Winner = settledMatchesPool.find(sm => sm.winner === p2 && sm.loser === p1);
        if (p2Winner) {
            const lenBefore = settledMatchesPool.length;
            settledMatchesPool = settledMatchesPool.filter(sm => sm !== p2Winner);
            if (lenBefore - 1 !== settledMatchesPool.length) throw new Error('Should only remove one settled match');
            return p2;
        }

        // no winner determined for this match yet
        return undefined;
    }

    const results: MatchResult[] = [];
    let result: MatchResult;
    let i = 0;
    do {
        result = await play(players, determineWinner);
        drawMatchResults(result);
        if (!result.finished)
            results.push(result);
        i++;
    } while (playersNotPlaying(players).length && !result.finished && i < 10000);

    console.log(results);
    let filteredResults = results.reverse();

    buildAndDrawTrees(filteredResults, ctx);
}

function createCanvas(parent: Element) {
    const canvas = document.createElement('canvas');
    parent.prepend(canvas);
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight * 2;
    const ctx = canvas.getContext('2d')!;
    return ctx;
}

function drawMatchResults(result: MatchResult) {
    drawMatchResult(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner?.name ?? '?');
}

function drawMatchResult(text: string) {
    const div = document.createElement('div');
    div.innerText = text;
    document.querySelector('#log')!.appendChild(div);
}