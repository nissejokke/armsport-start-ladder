import { MatchResult, Player, play } from "./play";
import { TestPlayer } from "./play_test";
import { TreeNode, appendTree, printTree, searchTree } from "./tree";


export interface InitLadderArgs {
}

let ctx: CanvasRenderingContext2D | undefined = undefined;

export async function initLadder(args: InitLadderArgs) {

    const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight;
    ctx = canvas.getContext('2d')!;
    // const names = [
    //     'Kent Andersson',
    //     'Totte',
    //     'Palten',
    //     'Cronblad',
    //     'Alex',
    //     'Strumpan',
    //     'Viktor',
    //     'Dagblad',
    //     'Klubban'
    // ];
    const players: TestPlayer[] = [
        { name: 'Alexander', strength: 4, wins: [], losses: [], rest: 0 },
        { name: 'Cronblad', strength: 5, wins: [], losses: [], rest: 0 },
        { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
        { name: 'Jonna', strength: 1, wins: [], losses: [], rest: 0 },
        { name: 'Viktoria', strength: 2, wins: [], losses: [], rest: 0 },
    ];

    // const players: TestPlayer[] = [
    //     { name: 'Kent', strength: 3, wins: [], losses: [], rest: 0 },
    //     { name: 'Alex', strength: 2, wins: [], losses: [], rest: 0 },
    //     { name: 'Ledin', strength: 1, wins: [], losses: [], rest: 0 },
    //     { name: 'Johan', strength: 1.5, wins: [], losses: [], rest: 0 },
    // ];

    async function chooseWinner(p1: TestPlayer, p2: TestPlayer): Promise<Player> {
        const winner = p1.strength > p2.strength ? p1 : p2;
        return winner;
    }
    // async (p1, p2) => players.indexOf(p1) < players.indexOf(p2) ? p1 : p2
    
    // const names = [
    //     'Kent',
    //     'Alex',
    //     'Johan',
    //     'Ledin'
    // ];
    // const players: Player[] = names.map(name => ({ name, wins: [], losses: [], rest: 0 }));
 
    const shuffledPlayers = [...players]; //shuffle(players);

    const results: MatchResult[] = [];
    let result: MatchResult;
    do {
        result = await play(players, chooseWinner as (p1: Player, p2: Player) => Promise<Player>);
        drawMatchResults(result);
        results.push(result);
    } while (!result.finished);

    const root = buildTree(results.reverse());
    drawTree(root);
}

function buildTree(results: MatchResult[]) {
    const root = appendTree(results[1]);

    for (let i = 2; true; i++) {
        const result = results[i];
        if (!result) break;
        console.log(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner.name);
        const leaves = searchTree(root, (node) => {
            return node.data.players!.includes(result.winner);
        });
        console.log(leaves);
        if (leaves.length === 0) throw new Error('No leaves found, was searching for ' + result.winner.name + ' or ' + result.loser?.name + ' in tree');
        appendTree(result, leaves[0]); // first leave should be children rather than parent
        
        console.log('tree (#' + i + ')');
        printTree(root, (node) => node.data.players!.map(p => p.name).join(' vs '));
    }

    return root;
}

function drawTree(node: TreeNode<MatchResult>) {
    const x = 500;
    const y = 20;
    drawTreeInternal(node, 0, y, x);
}

function drawTreeInternal(node: TreeNode<MatchResult>, depth, offsetY, offsetX) {
        
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

        ctx!.beginPath();
        ctx!.moveTo(rootX, rootY);
        ctx!.lineTo(x, y);
        ctx!.fill();

        drawNode(node.data.players?.[playerIndex]?.name ?? '?', y, x);
    }

    const rootX = getX(depth);
    const rootY = getY(depth);
    
    // player and winner is the same so no need to draw both except for on top level
    if (depth === 0)
        drawNode(node.data.winner.name, rootY, rootX);

    drawPlayer(0);
    drawPlayer(1);
        
    const winnerIndex = node.data.players?.findIndex(p => p === node.data.winner)!;
    let childIndex = 0;
    for (const childNode of node.children) {
        // makes sure sub tree is placed under winner
        if (childNode.data.winner === node.data.winner)
            childIndex = winnerIndex;
        else 
            childIndex = 1 - winnerIndex;
        
        const y = getY(depth+1);
        const x = getX(depth+1, childIndex);
        
        ctx!.beginPath();
        ctx!.moveTo(rootX, rootY);
        ctx!.lineTo(x, y);
        ctx!.fill();

        drawTreeInternal(childNode, depth + 1, offsetY, x );
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
    drawMatchResult(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner.name);
}

function drawMatchResult(text: string) {
    const div = document.createElement('div');
    div.innerText = text;
    document.querySelector('#ladder')!.appendChild(div);
}