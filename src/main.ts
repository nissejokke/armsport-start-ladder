import { MatchResult, Player, play } from "./play";
import { TreeNode, appendTree, printTree, searchTree } from "./tree-node";


export interface InitLadderArgs {
}

let ctx: CanvasRenderingContext2D | undefined = undefined;

export async function initLadder(args: InitLadderArgs) {

    const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
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
    const names = [
        'Kent',
        'Alex',
        'Johan',
        'Ledin'
    ];
    const players: Player[] = names.map(name => ({ name, wins: [], losses: [], rest: 0 }));
 
    const shuffledPlayers = [...players]; //shuffle(players);

    const results: MatchResult[] = [];
    let result: MatchResult;
    do {
        result = await play(players, async (p1, p2) => players.indexOf(p1) < players.indexOf(p2) ? p1 : p2);
        drawMatchResults(result);
        // buildTreeNode(result);
        results.push(result);
    } while (!result.finished);

    const root = buildTree(results.reverse());
    drawTree(root, 1, 20, 400);
}

function buildTree(results: MatchResult[]) {
    const root = appendTree(results[1]);

    for (let i = 2; i < 20; i++) {
        const result = results[i];
        if (!result) break;
        console.log(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner.name);
        const leaves = searchTree(root, (node) => {
            return node.data.players!.includes(result.winner);
        });
        console.log(leaves);
        if (leaves.length === 0) throw new Error('No leaves found, was searching for ' + result.winner.name + ' or ' + result.loser?.name + ' in tree');
        appendTree(result, leaves[0]); // first leave should be children rather than parent
        console.log('tree:');
        printTree(root, (node) => node.data.players!.map(p => p.name).join(' vs '));
    }

    return root;
}

function drawTree(node: TreeNode<MatchResult>, depth, offsetY, offsetX) {
    
    let childIndex = 0;
    
    function getX(depth, childIndex) {
        const x = 70 * 1*(5-depth) + (depth === 1 ? 100 : 0);
        return offsetX + childIndex * x - x/2;
    }
    function getY(depth) {
        return offsetY + (100*(1));
    }
    
    drawNode(node.data.winner.name, offsetY, offsetX);

    for (const childNode of node.children) {
        const y = getY(depth);
        const x = getX(depth, childIndex);
        
        ctx!.beginPath();
        ctx!.moveTo(offsetX, offsetY);
        ctx!.lineTo(x, y);
        ctx!.fill();

        drawTree(childNode, depth + 1, y, x );
        childIndex++;
    }

    if (node.children.length === 0) {
        let y = getY(depth + 1);
        let x = getX(depth + 1, 0);

        ctx!.beginPath();
        ctx!.moveTo(offsetX, offsetY);
        ctx!.lineTo(x, y);
        ctx!.fill();

        drawNode(node.data.players?.[0]?.name ?? '?', y, x);

        y = getY(depth + 1);
        x = getX(depth + 1, 1);

        ctx!.beginPath();
        ctx!.moveTo(offsetX, offsetY);
        ctx!.lineTo(x, y);
        ctx!.fill();

        drawNode(node.data.players?.[1]?.name ?? '?', y, x);
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

    // drawNode(result.players?.[0].name ?? '?');
    // drawNode(result.players?.[1].name ?? '?');
}

function drawMatchResult(text: string) {
    const div = document.createElement('div');
    div.innerText = text;
    document.querySelector('#ladder')!.appendChild(div);
}