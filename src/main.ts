import { buildAndDrawTrees } from "./build-and-draw-tree";
import { MatchResult, Player, play, playersNotPlaying, writePlayerStats } from "./play";
import { Competition, getCompetition, updateCompetition } from "./store";

interface SettledMatch {
    winner: Player;
    loser: Player;
}

export interface InitLadderArgs {
    competition: Competition;
}

export type MatchResultCallback = (winner?: Player, loser?: Player) => void;

export async function initLadder({ competition }: InitLadderArgs) {

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
        if (!loser) throw new Error(`Save state invalid, cannot find player with name ${settledMatchName.winner}`);
        
        return {
            winner,
            loser
        };
    });
    
    initPlay(competition, shuffledPlayers, settledMatches);
}

async function initPlay(competition: Competition, players: Player[], settledMatches: SettledMatch[]) {

    function onMatchResult(winner?: Player, loser?: Player) {
        // match result callback, recalc everything
        if (!winner || !loser) throw new Error('No winner or loser');
        settledMatches.push({ winner, loser });
        updateCurrentCompetition({ competition, players, settledMatches });
        resetPlayers(players);
        initPlay(competition, players, settledMatches);
    }

    const matchResults = await playBuildAndDraw(players, settledMatches, onMatchResult);

    writeStatus({ players, matchResults, onMatchResult });
    writePlayerStats(players);
    writePlayerStatsTable(players);
}

function updateCurrentCompetition(args: { competition: Competition, players: Player[], settledMatches: SettledMatch[] }) {

    const { competition, players, settledMatches} = args;

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
    const text = document.querySelector('#status #text')!;
    text.textContent = '';
    const list = document.querySelector('#status ul')!;
    while (list.childNodes.length)
        list.removeChild(list.childNodes[0]);
    document.querySelector('#status p')!.textContent = '';

    const nextUp = matchResults.filter(r => !r.winner && r.players?.filter(isPlayerStillIn).length === 2);
    if (nextUp.length) {
        const playerLeft = players.filter(isPlayerStillIn).length;
        let label = '';
        switch (playerLeft) {
            case 2: label = 'Final '; break;
            case 3: label = 'Semi-final '; break;
            default:
                label = '';
                break;
        }

        const lbl = document.createElement('span');
        lbl.classList.add('bold');
        lbl.textContent = label;
        text.appendChild(lbl);

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
        text.textContent = 'Winner: ' + players.find(p => p.losses.length < 2)?.name ?? '';
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