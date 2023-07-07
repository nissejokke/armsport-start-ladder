import { buildTree } from "./build-tree";
import { drawTree } from "./draw-tree";
import { MatchResult } from "./play";

export function buildAndDrawTrees(results: MatchResult[], ctx: CanvasRenderingContext2D) {
    let filteredResults = [...results];
    let allResultsUsed: MatchResult[] = [];
    let treeYPos = 0;
    let treeIndex = 0;
    do {
        const { rootNode, resultsUsed } = buildTree(filteredResults);
        allResultsUsed.push(...resultsUsed);
        console.log(resultsUsed);
        const { treeHeight } = drawTree(rootNode, treeYPos, treeIndex, ctx);
        filteredResults = filteredResults.filter(r => !allResultsUsed.includes(r));
        treeYPos += treeHeight;
        treeIndex++;
    } while (filteredResults.length);
}