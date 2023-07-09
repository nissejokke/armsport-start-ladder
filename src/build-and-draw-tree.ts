import { buildTree } from "./build-tree";
import { drawTree } from "./draw-tree";
import { MatchResult } from "./play";
import { TreeCanvas } from "./tree-canvas";

export function buildAndDrawTrees(results: MatchResult[], ctx: CanvasRenderingContext2D) {
    let filteredResults = [...results];
    let allResultsUsed: MatchResult[] = [];
    let treeYPos = 0;
    let treeIndex = 0;
    const canvas = new TreeCanvas(ctx);

    do {
        const { rootNode, resultsUsed } = buildTree(filteredResults);
        allResultsUsed.push(...resultsUsed);
        console.log(resultsUsed);
        const { treeHeight } = drawTree({ node: rootNode, treeY: treeYPos, treeIndex, canvas });
        filteredResults = filteredResults.filter(r => !allResultsUsed.includes(r));
        treeYPos += treeHeight;
        treeIndex++;
    } while (filteredResults.length);
}