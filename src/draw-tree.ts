import { MatchResult } from "./play";
import { TreeNode } from "./tree";

export function drawTree(node: TreeNode<MatchResult>, treeY: number, treeIndex: number, ctx: CanvasRenderingContext2D, depth = 0): { treeHeight: number} {
    
    console.log('depth=', calcMaxDepthOfTree(node));
    console.log('width=', calcWidthOfTree(node));
    console.log('height=', calcHeightOfTree(node));
    
    const height = calcHeightOfTree(node);
    let x = calcWidthOfTree(node) + 100;
    // baseOffset + startPos of tree + half height of tree + padding
    let y = 220 + treeY + height/2 + treeIndex * 30;

    drawTreeAtPosition(node, x, y, ctx);

    return { treeHeight: calcHeightOfTree(node) };
}

function getX(offsetX: number, depth: number) {
    return offsetX - (depth * 100);
}

function getY(offsetY: number, depth: number, childIndex?: number) {
    const y = 100/depth*2;
    return offsetY + (childIndex !== undefined ? childIndex * y - y/2 : 0);
}

function calcMaxDepthOfTree(node: TreeNode<MatchResult>, depth = 1): number {
    const depths: number[] = [];
    if (node.children.length == 0)
        return depth;
    for (const child of node.children)
        depths.push(calcMaxDepthOfTree(child, depth + 1));
    return Math.max(...depths);
}

function calcHeightOfTree(node: TreeNode<MatchResult>) {
    const depth = calcMaxDepthOfTree(node);
    let y = 0;
    y = getY(y, 0);
    for (let i = 1; i <= depth; i++) {
        y = getY(y, i, 0);
    }
    return -y*2;
}

function calcWidthOfTree(node: TreeNode<MatchResult>) {
    const depth = calcMaxDepthOfTree(node);
    return -getX(0, depth);
}

function drawTreeAtPosition(node: TreeNode<MatchResult>, offsetX: number, offsetY: number, ctx: CanvasRenderingContext2D, depth = 0) {

    function drawPlayer(playerIndex) {
        let x = getX(offsetX, depth + 1);
        let y = getY(offsetY, depth + 1, playerIndex);

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(x, y);
        ctx.fill();

        drawNode(node.data.players?.[playerIndex]?.name ?? '?', y, x);
    }

    const rootX = getX(offsetX, depth);
    const rootY = getY(offsetY, depth);
    
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
        const y = getY(offsetY, depth+1, childIndex);
        
        drawTreeAtPosition(childNode, offsetX, y, ctx, depth + 1);
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
