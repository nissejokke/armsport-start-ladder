import { MatchResult, Player } from "./play.ts";
import { TreeNode } from "./tree.ts";

export interface TreeDrawing {
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    drawName: (args: { x: number, y: number, text: string, cssClass: string[], onClick?: () => void }) => void;
}

const treeLineXLength = 175;

export function drawTree({ node, treeY, treeIndex, canvas, onMatchResult, nextUp }: { node: TreeNode<MatchResult>; treeY: number; treeIndex: number; canvas: TreeDrawing; onMatchResult: (winner: Player, loser: Player) => void, nextUp?: MatchResult }): { treeHeight: number} {
    
    if (!node?.data) throw new Error('node data undefined');
    const depth = calcMaxDepthOfTree(node);
    const height = calcHeightOfTree(node);
    const treePadding = 100;
    const treeLeftMargin = 20;
    const treeTopMargin = 10;
    const x = calcWidthOfTree(node) + treeLeftMargin;
    // baseOffset + startPos of tree + half height of tree + padding
    const y = treeTopMargin + treeY + height/2 + treeIndex * treePadding;
    
    // console.log('depth=', depth);
    // console.log('width=', calcWidthOfTree(node));
    // console.log('height=', height);

    drawTreeAtPosition(node, depth, x, y, canvas, 0, onMatchResult, nextUp);

    return { treeHeight: height };
}

function getX(offsetX: number, depth: number) {
    return offsetX - (depth * treeLineXLength);
}

function getY(offsetY: number, depth: number, treeDepth: number, childIndex: number | undefined) {
    const y = (100 * treeDepth)/Math.max(depth * depth * depth * 0.20 + 1, 1);
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
    const treeDepth = calcMaxDepthOfTree(node);
    let y = 0;
    y = getY(y, 0, treeDepth, undefined);
    for (let i = 1; i <= treeDepth; i++) {
        y = getY(y, i, treeDepth, 0);
    }
    return -y*2;
}

function calcWidthOfTree(node: TreeNode<MatchResult>) {
    const depth = calcMaxDepthOfTree(node);
    return -getX(0, depth);
}

function drawTreeAtPosition(node: TreeNode<MatchResult>, treeDepth: number, offsetX: number, offsetY: number, canvas: TreeDrawing, depth: number, onMatchResult: (winner: Player, loser: Player) => void, nextUp?: MatchResult) {
    const rootX = getX(offsetX, depth);
    const rootY = getY(offsetY, depth, treeDepth, undefined);
    
    // line offset
    const lineXOffset = 20;
    const lineYOffset = treeDepth >= 5 ? 9 : 15;
    const lineSlope = 10;

    function drawPlayer(playerIndex: number) {
        let x = getX(offsetX, depth + 1);
        let y = getY(offsetY, depth + 1, treeDepth, playerIndex);

        canvas.line(x-(depth+1 !== treeDepth ? lineXOffset : 10), y+lineYOffset, rootX-lineXOffset-lineSlope, y+lineYOffset);
        canvas.line(rootX-lineXOffset-lineSlope, y+lineYOffset, rootX-lineXOffset, rootY+lineYOffset);
        const isNextUpMatch = /*depth === 0 && !node.data.winner &&*/ node.data === nextUp;
        canvas.drawName({ x, y, 
            text: node.data.players?.[playerIndex]?.name ?? '?', 
            cssClass: [depth >= 4 ? 'depth-gte-4' : 'depth-' + depth],
            onClick: isNextUpMatch ? () => {
                if (node.data.players?.[playerIndex] && node.data.players?.[1-playerIndex])
                    onMatchResult(
                        node.data.players![playerIndex]!, 
                        node.data.players![1-playerIndex]! 
                    );
            } : undefined,
        });
    }

    if (depth === 0)
        canvas.drawName({ 
            x: rootX, y: rootY, 
            text: node.data.winner?.name ? node.data.winner?.name : '?', cssClass: [],
        });
    if (depth === 0) {
        canvas.line(rootX-lineXOffset, rootY+lineYOffset, rootX + treeLineXLength, rootY+lineYOffset);
    }

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
        const y = getY(offsetY, depth+1, treeDepth, childIndex);
        
        drawTreeAtPosition(childNode, treeDepth, offsetX, y, canvas, depth + 1, onMatchResult);
        i++;
    }
}