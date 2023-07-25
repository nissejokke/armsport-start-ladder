import { buildAndDrawTrees } from "./build-and-draw-tree";
import { MatchResult, Player, play, playersNotPlaying, writePlayerStats } from "./play";
import { Competition, updateCompetition } from "./store";

interface SettledMatch {
    winner: Player;
    loser: Player;
}

export interface InitLadderArgs {
    competition: Competition;
}

export type MatchResultCallback = (winner?: Player, loser?: Player) => void;

let canvasHeight;
let canvasWidth;

export async function initLadder({ competition }: InitLadderArgs): Promise<{ competitionFinished: boolean; }> {

    const shuffledPlayers = [...competition.playerNames].map(name => ({
        name: name,
        wins: [],
        losses: [],
        rest: 0
    }));
    const settledMatches: SettledMatch[] = competition.settledMatchNames.map(settledMatchName => {
        const winner = shuffledPlayers.find(p => p.name === settledMatchName.winner);
        if (!winner) throw new Error(`Save state invalid, cannot find player with name ${settledMatchName.winner}`);
        const loser = shuffledPlayers.find(p => p.name === settledMatchName.loser);
        if (!loser) throw new Error(`Save state invalid, cannot find player with name ${settledMatchName.loser}`);
        
        return {
            winner,
            loser
        };
    });
    
    return await initPlay(competition, shuffledPlayers, settledMatches);
}

async function initPlay(competition: Competition, players: Player[], settledMatches: SettledMatch[]): Promise<{ competitionFinished: boolean; }> {

    function onMatchResult(winner?: Player, loser?: Player) {
        // this function can be called both without winner and loser, in that case just redraw
        // match result callback, recalc everything
        if (winner && loser)
            settledMatches.push({ winner, loser });
        updateCurrentCompetition({ competition, players, settledMatches });
        resetPlayers(players);
        initPlay(competition, players, settledMatches);
    }

    const matchResults = await playBuildAndDraw(players, settledMatches, onMatchResult);

    const result = writeStatus({ players, matchResults, onMatchResult });
    writePlayerStats(players);
    writePlayerStatsTable(players, matchResults);
    return result;
}

function updateCurrentCompetition(args: { competition: Competition, players: Player[], settledMatches: SettledMatch[] }) {

    const { competition, players, settledMatches } = args;

    if (players)
        competition.playerNames = players.map(p => p.name);
    if (settledMatches)
        competition.settledMatchNames = settledMatches.map(m => ({ winner: m.winner.name, loser: m.loser.name }));

    updateCompetition(competition.id, competition);
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
    
    const ctx = createCanvas(ladder, canvasWidth, canvasHeight);

    let settledMatchesPool = [...settledMatches];

    async function determineWinner(p1: Player, p2: Player): Promise<Player | undefined> {
        const sm = settledMatchesPool[0];
        // commented lines are to enabled plays other then the exakt order that is determined
        // however can be issues with that so keeping it simple for now

        // const indexOfFirstMatchWherePlayersHaveMet = settledMatchesPool.findIndex(s => (s.winner === p1 && s.loser === p2) || (s.winner === p2 && s.loser === p1));
        // if (indexOfFirstMatchWherePlayersHaveMet === -1)
        //     return undefined;
        // const settledMatchesSelection = settledMatchesPool.slice(0, indexOfFirstMatchWherePlayersHaveMet + 1);
        if (sm && sm.winner === p1 && sm.loser === p2) {
        // const p1Winner = settledMatchesSelection.find(sm => sm.winner === p1 && sm.loser === p2);
        // if (p1Winner) {
            const lenBefore = settledMatchesPool.length;
            settledMatchesPool.shift();
            // settledMatchesPool = settledMatchesPool.filter(sm => sm !== p1Winner);
            if (lenBefore - 1 !== settledMatchesPool.length) throw new Error('Should only remove one settled match');
            return p1;
        }
        // const p2Winner = settledMatchesSelection.find(sm => sm.winner === p2 && sm.loser === p1);
        // if (p2Winner) {
        if (sm && sm.winner === p2 && sm.loser === p1) {
            const lenBefore = settledMatchesPool.length;
            // settledMatchesPool = settledMatchesPool.filter(sm => sm !== p2Winner);
            settledMatchesPool.shift();
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

    addRemoveLastMatchButton(settledMatches, onMatchResult);

    const filteredResults = [...results].reverse();

    const { totalWidth, totalHeight } = buildAndDrawTrees(filteredResults, getNextUpMatches(results)[0], players, ctx, onMatchResult);
    // this is not great
    // sets canvas width and height after render
    canvasHeight = totalHeight * 2;
    canvasWidth = totalWidth;

    return results;
}

/**
 * Adds remove settled match button to last played match in match log
 */
function addRemoveLastMatchButton(settledMatches: SettledMatch[], onMatchResult: MatchResultCallback) {
    const entry = document.querySelector('#log div:last-child');
    if (entry) {
        const linkRemove = document.createElement('a');
        linkRemove.innerText = 'Undo';
        linkRemove.onclick = (e) => {
            e.preventDefault();
            settledMatches.pop();
            onMatchResult();
            return false;
        };
        linkRemove.href = '#';
        entry.appendChild(document.createTextNode(' '));
        entry.appendChild(linkRemove);
    }
}

function createCanvas(parent: Element, width?: number, height?: number): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    parent.prepend(canvas);
    if (width)
        canvas.width = width;
    else
        canvas.width = window.outerWidth * 3;
    if (height)
        canvas.height = height;
    else
        canvas.height = window.outerHeight * 10;

    const ctx = canvas.getContext('2d')!;
    return ctx;
}

function drawMatchResults(result: MatchResult) {
    const light = document.createElement('span');
    const bold = document.createElement('span');
    bold.classList.add('bold');
    
    const vs = document.createElement('span');
    vs.innerText = ' vs ';
    const log = document.querySelector('#log')!;
    const entry = document.createElement('div');

    entry.appendChild(document.createTextNode((log.childNodes.length + 1) + '. '));
    if (result.winner === result.players?.[0]) {
        bold.innerText = result.players?.[0].name ?? '?';
        light.innerText = result.players?.[1].name ?? '?';
        entry.appendChild(bold);
        entry.appendChild(vs);
        entry.appendChild(light);
        
    }
    else if (result.winner === result.players?.[1]) {
        light.innerText = result.players?.[0].name ?? '?';
        bold.innerText = result.players?.[1].name ?? '?';
        entry.appendChild(light);
        entry.appendChild(vs);
        entry.appendChild(bold);
    }
    else throw new Error();

    log.appendChild(entry);
}

function getNextUpMatches(matchResults: MatchResult[]): MatchResult[] {
    const nextUp = matchResults.filter(r => !r.winner && r.players?.filter(isPlayerStillIn).length === 2);
    return nextUp;
}

function writeStatus({ 
    players, matchResults, onMatchResult 
}: { 
    players: Player[], 
    matchResults: MatchResult[], 
    onMatchResult: MatchResultCallback 
}): { competitionFinished: boolean; } {
    const text = document.querySelector('#status #text')!;
    text.textContent = '';
    const list = document.querySelector('#status ul')!;
    while (list.childNodes.length)
        list.removeChild(list.childNodes[0]);
    document.querySelector('#status p')!.textContent = '';

    const nextUp = getNextUpMatches(matchResults);
    if (nextUp.length) {
        const [first] = nextUp;
        const playerLeft = players.filter(isPlayerStillIn).length;
        const playBetweenPlayersThatHaventLostAnyMatch = first.players?.filter(p => p.losses.length === 0).length === 2;
        let label = '';
        switch (playerLeft) {
            case 2: label = 'Final '; break;
            case 3: 
                if (playBetweenPlayersThatHaventLostAnyMatch) 
                    label = 'Elimination to final ';
                else
                    label = 'Semi-final '; 
                break;
            default:
                label = '';
                break;
        }

        const lbl = document.createElement('span');
        lbl.classList.add('bold');
        lbl.textContent = label;
        text.appendChild(lbl);

        const name1 = document.createElement('span');
        name1.textContent = first.players![0].name;
        name1.onclick = () => {
            onMatchResult(first.players![0], first.players![1]);
        };
        name1.classList.add('player', 'link');
        text.appendChild(name1);
        
        const separator = document.createElement('span');
        separator.textContent = ' vs ';
        text.appendChild(separator);
        
        const name2 = document.createElement('span');
        name2.textContent = first.players![1].name;
        name2.onclick = () => {
            onMatchResult(first.players![1], first.players![0]);
        };
        name2.classList.add('player', 'link');
        text.appendChild(name2);

        if (nextUp.length > 1) {
            for (const next of nextUp.slice(1)!) {
                const li = document.createElement('li');
                li.innerText = next!.players![0].name + ' vs ' + next!.players![1].name;
                list.appendChild(li);
            }

            document.querySelector('#status p')!.textContent = 'Preliminary matches after:';
        }
        return { competitionFinished: false };
    }
    else {
        text.textContent = 'Winner: ' + players.find(p => p.losses.length < 2)?.name ?? '';
        return { competitionFinished: true };
    }
}

function writePlayerStatsTable(players: Player[], matchResults: MatchResult[]) {
    const tableBody = document.querySelector('#result table tbody')!;
    while (tableBody.childNodes.length)
        tableBody.removeChild(tableBody.childNodes[0]);

    function appendTd(tr: HTMLTableRowElement, text: string | number, cssClass?: string) {
        let td = document.createElement('td');
        td.innerText = text.toString();
        if (cssClass)
            td.classList.add(cssClass);
        tr.appendChild(td);
    }
    
    const playersSortedOnScore = [...players].sort((a, b) => {
        if (a.losses.length >= 2 && b.losses.length < 2)
            return 1;
        if (b.losses.length >= 2 && a.losses.length < 2)
            return -1;
        return b.wins.length * 2 - b.losses.length - (a.wins.length * 2 - a.losses.length);
    });
    const playersSortedOnMatches = getPlayersFromMatchResults(matchResults);

    const playersLeft = players.filter(p => isPlayerStillIn(p)).length;
    const fewPlayers = playersLeft < 3;

    // players sorted on matches is more accurate when few matches left
    const playerDrawOrder = fewPlayers ? playersSortedOnMatches : playersSortedOnScore;

    let playerIndex = 0;
    for (const player of playerDrawOrder) {
        const tr = document.createElement('tr');

        let placing = '';
        let placingCssClass: string | undefined;
        if (playersLeft === 1) {
            if (playerIndex === 0) {
                placing = '1st';
                placingCssClass = 'gold';
            }
            else if (playerIndex === 1) {
                placing = '2nd';
                placingCssClass = 'silver';
            }
            else if (playerIndex === 2) {
                placing = '3rd';
                placingCssClass = 'bronze';
            }
        }
        else if (playersLeft === 2) {
            if (playerIndex === 2) {
                placing = '3rd';
                placingCssClass = 'bronze';
            }
        }
                
        appendTd(tr, placing, placingCssClass);
        appendTd(tr, player.name, !placing && !isPlayerStillIn(player) ? 'eliminated' : undefined);
        appendTd(tr, player.wins.length);
        appendTd(tr, player.losses.length);
        appendTd(tr, player.wins.length + player.losses.length);

        if (!isPlayerStillIn(player))
            tr.classList.add('lost');
        tableBody.appendChild(tr);
        playerIndex++;
    }
}

function isPlayerStillIn(player: Player): boolean {
    return player.losses.length < 2;
}

function getPlayersFromMatchResults(matchResults: MatchResult[]): Player[] {
    const players: Player[] = [];
    for (let i = matchResults.length - 1; i >= 0; i--) {
        if (matchResults[i]?.winner && !players.includes(matchResults[i].winner!))
            players.push(matchResults[i]?.winner!);
        const p1 = matchResults[i]?.players?.[0];
        const p2 = matchResults[i]?.players?.[1];
        if (p1 && !players.includes(p1))
            players.push(p1);
        if (p2 && !players.includes(p2))
            players.push(p2);
    }
    return players;
}