import { buildTree } from "./build-tree";
import { drawTree } from "./draw-tree";
import { MatchResult, Player } from "./play";
import { TreeNode } from "./tree";
import { TreeCanvas } from "./tree-canvas";

export function buildAndDrawTrees(results: MatchResult[], players: Player[], ctx: CanvasRenderingContext2D, onMatchResult: (winner?: Player, loser?: Player) => void) {
    let filteredResults = [...results];
    let allResultsUsed: MatchResult[] = [];
    const canvas = new TreeCanvas(ctx);
    let drawTreeNodes: TreeNode<MatchResult>[] = [];
    
    do {
        const { rootNode, resultsUsed } = buildTree(filteredResults);
        allResultsUsed.push(...resultsUsed);
        console.log(resultsUsed);
        drawTreeNodes.push(rootNode);
        filteredResults = filteredResults.filter(r => !allResultsUsed.includes(r));
    } while (filteredResults.length);
    
    let treeYPos = 0;
    let treeIndex = 0;
    for (const rootNode of drawTreeNodes.sort(createSortTreesFunction(players))) {
        const { treeHeight } = drawTree({ node: rootNode, treeY: treeYPos, treeIndex, canvas, onMatchResult });
        treeYPos += treeHeight;
        treeIndex++;
    }
}

function createSortTreesFunction(players: Player[]) {
    return (a: TreeNode<MatchResult>, b: TreeNode<MatchResult>): number => {
        const aPlayers = getAllPlayers(a);
        const bPlayers = getAllPlayers(b);

        // const aNoLosses = aPlayers.find(p => p.player.losses.length === 0 && p.player.wins.length);
        // const bNoLosses = bPlayers.find(p => p.player.losses.length === 0 && p.player.wins.length);

        // if (aNoLosses && !bNoLosses)
        //     return -1;
        // if (bNoLosses && !aNoLosses)
        //     return 1;

        // if (aNoLosses && bNoLosses) {
        //     const depthDiff = -aNoLosses.depth + bNoLosses.depth;
        //     if (depthDiff !== 0)
        //         return depthDiff;
        // }
        function getScore(av, cv) {
            return av + cv.player.wins.length;
        }
        const score = bPlayers.reduce(getScore, 0) - aPlayers.reduce(getScore, 0);
        if (score !== 0)
            return score;

        for (let i = 0; i < Math.min(aPlayers.length, bPlayers.length); i++) {
            const ai = players.indexOf(aPlayers[i].player);
            const bi = players.indexOf(bPlayers[i].player);
            if (ai !== bi && ai !== -1)
                return ai - bi;
        }
        return 0;
    };
}

function getAllPlayers(node: TreeNode<MatchResult>, depth = 0): { depth: number, player: Player }[] {
    const result: {depth: number, player: Player}[] = [];
    for (const child of node.children) {
        const subresults = getAllPlayers(child, depth + 1);
        result.push(...subresults);
    }
    for (const player of node.data.players ?? []) {
        result.push({ depth, player });
    }
    return result;
}
