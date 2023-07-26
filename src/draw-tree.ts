import { MatchResult, Player } from "./play.ts";
import { TreeNode } from "./tree.ts";

export interface TreeDrawing {
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    drawName: (args: { x: number, y: number, text: string, cssClass: string[], onClick?: () => void }) => void;
}

const treeLineXLength = 125;

export function drawTree({ 
    node, 
    treeY, 
    treeIndex, 
    canvas, 
    onMatchResult, 
    nextUp 
}: { 
    node: TreeNode<MatchResult>; 
    treeY: number; 
    treeIndex: number; 
    canvas: TreeDrawing; 
    onMatchResult: (winner: Player, loser: Player) => void; 
    nextUp?: MatchResult 
}): { treeWidth: number; treeHeight: number; treeYPos: number; } {
    
    if (!node?.data) throw new Error('node data undefined');
    const depth = calcMaxDepthOfTree(node) - 1;
    const height = calcHeightOfTree(node);
    const treePadding = 50;
    const treeLeftMargin = 20;
    const treeTopMargin = 10;
    const x = calcWidthOfTree(node) + treeLeftMargin;
    // baseOffset + startPos of tree + half height of tree + padding
    const y = treeTopMargin + treeY + height/2 + treeIndex * treePadding;

    // console.log('depth=', depth);
    // console.log('width=', calcWidthOfTree(node));
    // console.log('height=', height);

    drawTreeAtPosition(node, depth, x, y, canvas, 0, onMatchResult, nextUp);

    return { treeHeight: height, treeYPos: y, treeWidth: x };
}

function getX(offsetX: number, depth: number) {
    return offsetX - (depth * treeLineXLength);
}

function getY(offsetY: number, depth: number, treeDepth: number, childIndex: number | undefined) {
    const y = (Math.pow(treeDepth, 2.5) * 12 + 15)/1;
    return offsetY + (childIndex !== undefined ? childIndex * y - y/2 : 0);
}

function calcMaxDepthOfTree(node: TreeNode<MatchResult>, depth = 1): number {
    const depths: number[] = [];
    if (!node || node.children.length == 0)
        return depth;
    for (const child of node.children)
        depths.push(calcMaxDepthOfTree(child, depth + 1));
    return Math.max(...depths);
}

function calcHeightOfTree(node: TreeNode<MatchResult>) {
    const treeDepth = calcMaxDepthOfTree(node);
    let y = 0;
    for (let i = treeDepth; i >= 0; i--) {
        y = getY(y, i, i, 0);
    }
    return -y;
}

function calcWidthOfTree(node: TreeNode<MatchResult>) {
    const depth = calcMaxDepthOfTree(node);
    return -getX(0, depth);
}

function drawTreeAtPosition(node: TreeNode<MatchResult>, treeDepth: number, offsetX: number, offsetY: number, canvas: TreeDrawing, depth: number, onMatchResult: (winner: Player, loser: Player) => void, nextUp?: MatchResult) {
    if (!node.data.players) throw new Error('No node players');

    // determines if child should be placed to the top or bottom under parent match
    // depends on order of node.data.players and which child won
    const childIndices: number[] = [];
    if (node.children.length) {
        const childIndex = node.data.players.findIndex(p => node.children[0].data.winner === p);
        if (childIndex === -1) throw new Error('Could find player in child nodes');
        childIndices.push(childIndex);
    }
    if (node.children.length > 1) {
        const childIndex2 = node.data.players.findIndex(p => node.children[1].data.winner === p);
        childIndices.push(childIndex2);
    }
    
    const rootX = getX(offsetX, depth);
    const rootY = getY(offsetY, depth, treeDepth, undefined);
    
    // line offset
    const lineXOffset = 20;
    const lineYOffset = 10; // >= 5 ? 9 : 15;
    const lineSlope = 10;

    function drawPlayer(playerIndex: number) {
        let subTreeDepth;
        // find child node to use for calculating depth from player index
        const childIndex = childIndices.findIndex(c => c === playerIndex);
        if (node.children[childIndex]) {
            subTreeDepth = calcMaxDepthOfTree(node.children[childIndex]);
        }
        else 
            subTreeDepth = 0;

        let x = getX(offsetX, depth + 1);
        let y = getY(offsetY, depth + 1, subTreeDepth, playerIndex);

        // horizontal line
        canvas.line(x-(subTreeDepth !== 0 ? lineXOffset : 10), y+lineYOffset, rootX-lineXOffset-lineSlope, y+lineYOffset);
        // connecting line
        canvas.line(rootX-lineXOffset-lineSlope, y+lineYOffset, rootX-lineXOffset, rootY+lineYOffset);
        const isNextUpMatch = node.data === nextUp;
        const cssClass = ['depth-' + depth];
        if (depth >= 4)
            cssClass.push('depth-gte-4');
        if (depth >= 6)
            cssClass.push('depth-gte-6');
        if (depth >= 7)
            cssClass.push('depth-gte-7');

        canvas.drawName({ x, y, 
            text: (node.data.players?.[playerIndex]?.name ?? '?') /*+ ' ' + subTreeDepth*/, 
            cssClass,
            onClick: isNextUpMatch ? () => {
                if (node.data.players?.[playerIndex] && node.data.players?.[1-playerIndex])
                    onMatchResult(
                        node.data.players![playerIndex]!, 
                        node.data.players![1-playerIndex]! 
                    );
            } : undefined,
        });
    }

    if (depth === 0) {
        canvas.drawName({ 
            x: rootX, y: rootY, 
            text: node.data.winner?.name ? node.data.winner?.name : '?', cssClass: [],
        });
        canvas.line(rootX-lineXOffset, rootY+lineYOffset, rootX + treeLineXLength, rootY+lineYOffset);
    }

    drawPlayer(0);
    drawPlayer(1);

    let i = 0;
    for (const childNode of node.children) {
        const childIndex = childIndices[i];
        const subTreeDepth = calcMaxDepthOfTree(childNode);
        const y = getY(offsetY, depth+1, subTreeDepth, childIndex);
        
        drawTreeAtPosition(childNode, subTreeDepth, offsetX, y, canvas, depth + 1, onMatchResult);
        i++;
    }
}