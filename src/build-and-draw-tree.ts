import { buildTree } from "./build-tree";
import { drawTree } from "./draw-tree";
import { MatchResult } from "./play";

export function buildAndDrawTrees(results: MatchResult[], ctx: CanvasRenderingContext2D) {
    let filteredResults = [...results];
    let allResultsUsed: MatchResult[] = [];
    let x = 500;
    let y = 220;
    do {
        const { rootNode, resultsUsed } = buildTree(filteredResults);
        allResultsUsed.push(...resultsUsed);
        console.log(resultsUsed);
        drawTree(rootNode, x, y, ctx);
        filteredResults = filteredResults.filter(r => !allResultsUsed.includes(r));
        y += 250;
    } while (filteredResults.length);
}