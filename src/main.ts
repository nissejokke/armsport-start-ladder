import { buildAndDrawTrees } from "./build-and-draw-tree";
import { MatchResult, Player, play, playersNotPlaying, writePlayerStats } from "./play";
import { TestPlayer } from "./play_test";

interface SettledMatch {
    winner: Player;
    loser: Player;
}

export interface InitLadderArgs {
    playerNames: string[];
}

export type MatchResultCallback = (winner?: Player, loser?: Player) => void;

export async function initLadder({ playerNames }: InitLadderArgs) {
   
    // const players: TestPlayer[] = [
    //     { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
    //     { name: 'Totte', strength: 8, wins: [], losses: [], rest: 0 },
    //     { name: 'Jonna', strength: 1.5, wins: [], losses: [], rest: 0 },
    //     { name: 'Cronblad', strength: 6, wins: [], losses: [], rest: 0 },
    //     { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 }, // 4
    //     { name: 'Palten', strength: 5, wins: [], losses: [], rest: 0 },
    //     { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
    //     { name: 'Hilda', strength: 1, wins: [], losses: [], rest: 0 },
    // ];
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
 
    // let shuffledPlayers = [...players] as Player[]; //shuffle(players);
    const settledMatches: SettledMatch[] = [];
    // await playBuildAndDraw(shuffledPlayers, settledMatches);
    
    // await new Promise(r => { setTimeout(r, 1000); });
    const shuffledPlayers = [...playerNames].map(name => ({
        name: name,
        wins: [],
        losses: [],
        rest: 0
    }));
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[0] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[2] });
    // settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[5] });
    // settledMatches.push({ winner: shuffledPlayers[6], loser: shuffledPlayers[7] });
    // settledMatches.push({ winner: shuffledPlayers[5], loser: shuffledPlayers[7] });
    // settledMatches.push({ winner: shuffledPlayers[0], loser: shuffledPlayers[2] });
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[3] });
    // settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[6] });
    // settledMatches.push({ winner: shuffledPlayers[5], loser: shuffledPlayers[0] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[6] }); // 2
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[4] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[5] });
    // settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[1] }); // 3
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[1] }); // 4 and 2
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[4] }); // 5

    /**
     * 0 Alex
       1 Cronblad
       2 Viktoria
       3 Kent
       4 Jonna
     */
    settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[0] });
    settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[2] });
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[4] });
    // settledMatches.push({ winner: shuffledPlayers[0], loser: shuffledPlayers[2] });
    // settledMatches.push({ winner: shuffledPlayers[0], loser: shuffledPlayers[4] });
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[3] });
    // settledMatches.push({ winner: shuffledPlayers[0], loser: shuffledPlayers[3] });
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[0] });

    initPlay(shuffledPlayers, settledMatches);
}

async function initPlay(players: Player[], settledMatches: SettledMatch[]) {

    function onMatchResult(winner?: Player, loser?: Player) {
        // match result callback, recalc everything
        if (!winner || !loser) throw new Error('No winner or loser');
        settledMatches.push({ winner, loser });
        resetPlayers(players);
        initPlay(players, settledMatches);
    }

    const matchResults = await playBuildAndDraw(players, settledMatches, onMatchResult);

    writeStatus({ players, matchResults, onMatchResult });
    writePlayerStats(players);
    writePlayerStatsTable(players);
}

function resetPlayers(players: Player[]): void {
    for (const player of players) {
        player.rest = 0;
        player.wins = [];
        player.losses = [];
        player.isPlaying = false;
    }
}

async function playBuildAndDraw(
    players: Player[], 
    settledMatches: SettledMatch[], 
    onMatchResult: MatchResultCallback
): Promise<MatchResult[]> {
    // prepare html stuff
    const ladder = document.querySelector('#ladder')!;
    while (ladder.childNodes.length)
    ladder.removeChild(ladder.childNodes[0]);

    const log = document.querySelector('#log')!;
    while (log.childNodes.length)
        log.removeChild(log.childNodes[0]);
    
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
        if (!result.finished) {
            results.push(result);
            if (result.winner)
                drawMatchResults(result);
        }
        i++;
    } while (playersNotPlaying(players).length && !result.finished && i < 10000);

    console.log(results);

    const filteredResults = [...results].reverse();

    buildAndDrawTrees(filteredResults, players, ctx, onMatchResult);

    return results;
}

function createCanvas(parent: Element) {
    const canvas = document.createElement('canvas');
    parent.prepend(canvas);
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight * 10;
    const ctx = canvas.getContext('2d')!;
    return ctx;
}

function drawMatchResults(result: MatchResult) {
    // const header = document.createE
    // document.querySelector('#log')!.appendChild(div);
    drawMatchResult(result.players?.[0].name  + ' vs ' + result.players?.[1]?.name + ', winner: ' + (result.winner?.name ?? '?'));
}

function drawMatchResult(text: string) {
    const div = document.createElement('div');
    div.innerText = text;
    document.querySelector('#log')!.appendChild(div);
}

function writeStatus({ 
    players, matchResults, onMatchResult 
}: { 
    players: Player[], 
    matchResults: MatchResult[], 
    onMatchResult: MatchResultCallback 
}) {
    const header = document.querySelector('#status #header')!;
    header.textContent = '';
    const text = document.querySelector('#status #text')!;
    text.textContent = '';
    const list = document.querySelector('#status ul')!;
    while (list.childNodes.length)
        list.removeChild(list.childNodes[0]);


    const name1: HTMLElement = document.querySelector('#status #name1')!;
    const name2: HTMLElement = document.querySelector('#status #name2')!;

    const nextUp = matchResults.filter(r => !r.winner);
    if (nextUp.length) {
        const playerLeft = players.filter(isPlayerStillIn).length;
        let label = '';
        switch (playerLeft) {
            case 2: label = 'Final'; break;
            case 3: label = 'Semi-final'; break;
            default:
                label = 'Next up';
                break;
        }

        header.textContent = label;
        const name1 = document.createElement('span');
        name1.textContent = nextUp[0].players![0].name;
        name1.onclick = () => {
            onMatchResult(nextUp[0].players![0], nextUp[0].players![1]);
        };
        name1.classList.add('player', 'link');
        text.appendChild(name1);
        
        const separator = document.createElement('span');
        separator.textContent = ' vs ';
        text.appendChild(separator);
        
        const name2 = document.createElement('span');
        name2.textContent = nextUp[0].players![1].name;
        name2.onclick = () => {
            onMatchResult(nextUp[0].players![1], nextUp[0].players![0]);
        };
        name2.classList.add('player', 'link');
        text.appendChild(name2);

        if (nextUp.length > 1) {
            for (const next of nextUp.slice(1)!) {
                const li = document.createElement('li');
                li.innerText = next!.players![0].name + ' vs ' + next!.players![1].name;
                list.appendChild(li);
            }

            document.querySelector('#status p')!.textContent = 'Preliminary matches after that:';
        }
    }
    else {
        header.textContent = 'Winner: ';
        const span = document.createElement('span');
        span.innerText = players.find(p => p.losses.length < 2)?.name ?? '';
        header.appendChild(span);
        name1.textContent = '';
        name2.textContent = '';
    }
}

function writePlayerStatsTable(players: Player[]) {
    const tableBody = document.querySelector('#result table tbody')!;
    while (tableBody.childNodes.length)
        tableBody.removeChild(tableBody.childNodes[0]);

    function appendTd(tr, text) {
        let td = document.createElement('td');
        td.innerText = text;
        tr.appendChild(td);
    }
    
    const playersSortedOnScore = [...players].sort((a, b) => {
        if (a.losses.length >= 2 && b.losses.length < 2)
            return 1;
        if (b.losses.length >= 2 && a.losses.length < 2)
            return -1;
        return b.wins.length * 2 - b.losses.length - (a.wins.length * 2 - a.losses.length);
    });
    for (const player of playersSortedOnScore) {
        const tr = document.createElement('tr');
        appendTd(tr, player.name);
        appendTd(tr, player.wins.length);
        appendTd(tr, player.losses.length);
        appendTd(tr, player.wins.length + player.losses.length);

        if (!isPlayerStillIn(player))
            tr.classList.add('lost');
        tableBody.appendChild(tr);
    }
}

function isPlayerStillIn(player: Player): boolean {
    return player.losses.length < 2;
}