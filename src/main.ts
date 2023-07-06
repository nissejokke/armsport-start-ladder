import { MatchResult, Player, play, playersNotPlaying } from "./play";
import { TestPlayer } from "./play_test";
import { TreeNode, appendTree, printTree, searchTree } from "./tree";

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
    settledMatches.push({ winner: shuffledPlayers[5], loser: shuffledPlayers[0] });
    settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[6] });

    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[2] });
    // settledMatches.push({ winner: shuffledPlayers[3], loser: shuffledPlayers[0] });
    // settledMatches.push({ winner: shuffledPlayers[4], loser: shuffledPlayers[6] });
    // settledMatches.push({ winner: shuffledPlayers[1], loser: shuffledPlayers[5] });
    // settledMatches.push({ winner: shuffledPlayers[0], loser: shuffledPlayers[6] });
    await playBuildAndDraw(shuffledPlayers, settledMatches);
}

async function playBuildAndDraw(players: Player[], settledMatches: SettledMatch[]) {
    const ladder = document.querySelector('#ladder')!;
    while (ladder.childNodes.length)
        ladder.removeChild(ladder.childNodes[0]);
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
    } while (playersNotPlaying(players).length && !result.finished && i < 20);

    console.log(results);
    let filteredResults = results.reverse();
    drawTrees(filteredResults);
}

function drawTrees(results: MatchResult[]) {
    const ladder = document.querySelector('#ladder')!;
    const canvas = document.createElement('canvas');
    ladder.prepend(canvas);
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight;
    const ctx = canvas.getContext('2d')!;

    let filteredResults = [...results];
    let allResultsUsed: MatchResult[] = [];
    let x = 500;
    let y = 220;
    do {
        const { rootNode, resultsUsed } = buildTree(filteredResults);
        allResultsUsed.push(...resultsUsed);
        console.log(resultsUsed);
        drawTree(rootNode, x, y, ctx);
        filteredResults = filteredResults.filter(r => !allResultsUsed.includes(r));
        y += 200;
    } while (filteredResults.length);
}

function buildTree(results: MatchResult[]): { rootNode: TreeNode<MatchResult>, resultsUsed: MatchResult[] } {
    const root = appendTree(results[0]);
    let i: number;
    const resultsUsed: MatchResult[] = [results[0]];

    for (i = 1; i < results.length; i++) {
        const result = results[i];
        if (!result) { break };
        console.log(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner?.name);
        const foundNodes = searchTree(root, (node) => {
            if (!result.winner) return false;
            return node.data.players!.includes(result.winner);
        });
        console.log(foundNodes);
        if (foundNodes.length === 0) {
            console.log('No nodes found, was searching for ' + result.winner?.name + ' or ' + result.loser?.name + ' in tree');
            continue;
        }
        appendTree(result, foundNodes[0]); // first leave should be children rather than parent
        resultsUsed.push(result);

        console.log('tree (#' + i + ')');
        printTree(root, (node) => node.data.players!.map(p => p.name).join(' vs '));
    }

    return { rootNode: root, resultsUsed };
}

function drawTree(node: TreeNode<MatchResult>, x: number, y: number, ctx: CanvasRenderingContext2D) {
    drawTreeInternal(node, 0, y, x, ctx);
}

function drawTreeInternal(node: TreeNode<MatchResult>, depth: number, offsetY: number, offsetX: number, ctx: CanvasRenderingContext2D) {
        
    function getX(depth, childIndex?: number) {
        const x = 30 * 1*(7-depth) + 100/depth*2;
        return offsetX + (childIndex !== undefined ? childIndex * x - x/2 : 0);
    }

    function getY(depth) {
        return offsetY + (depth * 50);
    }

    function drawPlayer(playerIndex) {
        let y = getY(depth + 1);
        let x = getX(depth + 1, playerIndex);

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(x, y);
        ctx.fill();

        drawNode(node.data.players?.[playerIndex]?.name ?? '?', y, x);
    }

    const rootX = getX(depth);
    const rootY = getY(depth);
    
    // player and winner is the same so no need to draw both except for on top level
    // if (depth === 0)
        drawNode(node.data.winner?.name ?? '?', rootY, rootX);

    drawPlayer(0);
    drawPlayer(1);
        
    if (!node.data.players) throw new Error('No node players');

    // players Kent, Cronblad
    // node data winner undefined
    // children: Jonna Cronblad, Totte Kent (both winners and players)

    // players Totte Cronblad
    // children: Kent - Totte

    const children = [...node.children].sort((a, b) => {
        // if players in child a is in node players then sort it before child b
        if (a.data.players?.some(p => node.data.players!.includes(p)))
            return -1;
        if (b.data.players?.some(p => node.data.players!.includes(p)))
            return 1;
        return 0;
    });

    let childIndex = 0;
    // when only child, set childIndex manually
    if (children.length === 1) {
        childIndex = node.data.players!.findIndex(p => node.children[0].data.players?.includes(p));
    }

    for (const childNode of children) {
        const y = getY(depth+1);
        const x = getX(depth+1, childIndex);
        
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(x, y);
        ctx.fill();

        drawTreeInternal(childNode, depth + 1, offsetY, x, ctx);
        childIndex++;
    }
}

function drawNode(text, offsetY = 0, offsetX = 0) {
    const div = document.createElement('div');
    div.classList.add('node');
    div.setAttribute('style', `left: ${offsetX}px; top: ${offsetY}px`);
    div.innerText = text;
    document.querySelector('#ladder')!.appendChild(div);
}


function drawMatchResults(result: MatchResult) {
    drawMatchResult(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner?.name ?? '?');
}

function drawMatchResult(text: string) {
    const div = document.createElement('div');
    div.innerText = text;
    document.querySelector('#log')!.appendChild(div);
}