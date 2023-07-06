import { buildTree } from "./build-tree";
import { MatchResult } from "./play";
import { TreeNode } from "./tree";

export function drawTree(node: TreeNode<MatchResult>, x: number, y: number, ctx: CanvasRenderingContext2D) {
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
    // keeping this as it reveals issues with printing the tree
    drawNode(node.data.winner?.name ?? '?', rootY, rootX);

    drawPlayer(0);
    drawPlayer(1);
        
    if (!node.data.players) throw new Error('No node players');

    // players Kent, Cronblad
    // node data winner undefined
    // children: Jonna Cronblad, Totte Kent (both winners and players)

    // players Totte Cronblad
    // children: Kent - Totte

    // players Alexander Totte
    // children: Alexander - Totte (w)
    // corrent child index: 1

    // determines if child should be placed to the left och right under parent match
    // depends on order of node.data.players and which child won
    const childIndices: number[] = [];
    if (node.children.length) {
        const childIndex = node.data.players.findIndex(p => node.children[0].data.winner === p);
        childIndices.push(childIndex);
    }
    if (node.children.length > 1) {
        const childIndex2 = node.data.players.findIndex(p => node.children[1].data.winner === p);
        childIndices.push(childIndex2);
    }

    let i = 0;
    for (const childNode of node.children) {
        const childIndex = childIndices[i];
        const y = getY(depth+1);
        const x = getX(depth+1, childIndex);
        
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(x, y);
        ctx.fill();

        drawTreeInternal(childNode, depth + 1, offsetY, x, ctx);
        i++;
    }
}

function drawNode(text, offsetY = 0, offsetX = 0) {
    const div = document.createElement('div');
    div.classList.add('node');
    div.setAttribute('style', `left: ${offsetX}px; top: ${offsetY}px`);
    div.innerText = text;
    document.querySelector('#ladder')!.appendChild(div);
}
