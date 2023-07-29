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
    const depth = calcMaxDepthOfTree(node);
    const height = calcHeightOfTree(node);
    const treePadding = 50;
    const treeLeftMargin = 20;
    const treeTopMargin = 10;
    const x = calcWidthOfTree(node) + treeLeftMargin;
    // baseOffset + startPos of tree + half height of tree + padding
    const y = treeTopMargin + treeY + height/2 + treeIndex * treePadding;

    // console.log('depth=', depth);
    // console.log('width=', calcWidthOfTree(node));
    console.log('height=', height);

    drawTreeAtPosition(node, depth, x, y, canvas, 0, onMatchResult, depth, nextUp);

    return { treeHeight: height, treeYPos: y, treeWidth: x };
}

function getX(offsetX: number, depth: number) {
    return offsetX - (depth * treeLineXLength);
}

function getBranchYOffset(subTreeDepth:number, treeMaxDepth: number) {
    const pow = treeMaxDepth >= 5 ? 2.5 : 2;
    const divider = treeMaxDepth >= 5 ? 1 : 0.5;
    const y = (Math.pow(subTreeDepth, pow) * 12 + 15)/divider;
    return y;
}

function getY(node: TreeNode<MatchResult> | undefined, offsetY: number, depth: number, treeDepth: number, treeMaxDepth: number, childIndex: number | undefined) {
    // const y = getBranchYOffset(treeDepth, treeMaxDepth);
    const y = node ? calcHeightOfTree(node) / 2 : getBranchYOffset(0, treeMaxDepth);
    const yValue = offsetY + (childIndex !== undefined ? childIndex * y - y/2 : 0);
    return yValue;
}

function calcMaxDepthOfTree(node: TreeNode<MatchResult>, depth = 1): number {
    const depths: number[] = [];
    if (!node || node.children.length == 0)
        return depth;
    for (const child of node.children)
        depths.push(calcMaxDepthOfTree(child, depth + 1));
    return Math.max(...depths);
}

function calcHeightOfTree(node: TreeNode<MatchResult>, maxTreeDepth?:number) {
    const [miny, maxy] = calcTreeOffset(node, 0, undefined, maxTreeDepth);
    return maxy - miny;
}

function calcTreeOffset(node: TreeNode<MatchResult>, offsetY = 0, depth?: number, maxTreeDepth?:number): [number, number] {
    // const treeDepth = calcMaxDepthOfTree(node);
    // let y = 0;
    // for (let i = treeDepth; i >= 0; i--) {
    //     y = getY(y, i, i, treeDepth, 0);
    // }
    // return -y;

    // const treeDepth = calcMaxDepthOfTree(node);
    // const theTreeDepth = maxTreeDepth !== undefined ? maxTreeDepth : treeDepth;

    // const y = getBranchYOffset(treeDepth, theTreeDepth);
    // const y1 = offsetY + y - y/2;
    // const y2 = offsetY + y + y/2;

    // depthValues.push(y1, y2);
    
    // for (const child of node.children) {
    //     calcHeightOfTree(child, offsetY + y, depth + 1, depthValues, theTreeDepth);
    // }

    // const min = Math.min(...depthValues);
    // const max = Math.max(...depthValues);
    // return max - min;

    if (!node.data.players) throw new Error('No node players');

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

    const treeDepth = calcMaxDepthOfTree(node);
    const theTreeMaxDepth = maxTreeDepth !== undefined ? maxTreeDepth : treeDepth;
    const theDepth = depth !== undefined ? depth : theTreeMaxDepth;
    const y = getBranchYOffset(theDepth, theTreeMaxDepth);

    if (node.children.length === 0) {
        // return [offsetY 
        return [offsetY - 15, offsetY + 15];
    }

    let miny = Number.MAX_VALUE;
    let maxy = -Number.MAX_VALUE;
    for (const playerIndex of [0, 1]) {
        const childIndex = childIndices.findIndex(c => c === playerIndex);
        const childNode = node.children[childIndex];
        if (childNode) {
            // const subTreeDepth = calcMaxDepthOfTree(childNode);
            const newOffsetY = offsetY + (playerIndex === 0 ? -y/2 : y/2);
            const [y1, y2] = calcTreeOffset(childNode, newOffsetY, theDepth - 1, theTreeMaxDepth);
            if (y1 < miny) miny = y1;
            if (y2 > maxy) maxy = y2;
        }
    }
    if (miny === Number.MAX_VALUE) throw new Error();
    if (maxy === -Number.MAX_VALUE) throw new Error();
    return [miny, maxy];
}

function calcWidthOfTree(node: TreeNode<MatchResult>) {
    const depth = calcMaxDepthOfTree(node);
    return -getX(0, depth);
}

function drawTreeAtPosition(node: TreeNode<MatchResult>, treeDepth: number, offsetX: number, offsetY: number, canvas: TreeDrawing, depth: number, onMatchResult: (winner: Player, loser: Player) => void, treeMaxDepth: number, nextUp?: MatchResult) {
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
    const rootY = getY(node, offsetY, depth, treeDepth, treeMaxDepth, undefined);
    
    // line offset
    const lineXOffset = 20;
    const lineYOffset = 10; // >= 5 ? 9 : 15;
    const lineSlope = 10;

    function drawPlayer(playerIndex: number) {
        let subTreeDepth;
        // find child node to use for calculating depth from player index
        const childIndex = childIndices.findIndex(c => c === playerIndex);
        const childNode = node.children[childIndex];
        if (childNode) {
            subTreeDepth = calcMaxDepthOfTree(childNode);
        }
        else 
            subTreeDepth = 0;

        const x = getX(offsetX, depth + 1);
        const y = getY(childNode, offsetY, depth + 1, subTreeDepth, treeMaxDepth, playerIndex);

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
            text: (node.data.players?.[playerIndex]?.name ?? '?') + ' ' + (childNode ? Math.round(calcHeightOfTree(childNode, treeMaxDepth)) : ''), 
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
        const y = getY(childNode, offsetY, depth+1, subTreeDepth, treeMaxDepth, childIndex);
        
        drawTreeAtPosition(childNode, subTreeDepth, offsetX, y, canvas, depth + 1, onMatchResult, treeMaxDepth);
        i++;
    }
}