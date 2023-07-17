import { MatchResult } from "./play";
import { TreeNode, appendTree, searchTree, printTree } from "./tree";

/**
 * Create binary tree from match results
 * @param results rootNode - root of the tree
 * @param results resultsUsed - match results used to construct the tree
 * @returns 
 */
export function buildTree(results: MatchResult[]): { rootNode: TreeNode<MatchResult>, resultsUsed: MatchResult[] } {
    const root = appendTree(results[0]);
    let i: number;
    const resultsUsed: MatchResult[] = [results[0]];

    for (i = 1; i < results.length; i++) {
        const result = results[i];
        if (!result) { break };
        // console.log(result.players?.[0].name  + ' vs ' + result.players?.[1].name + ' = ' + result.winner?.name);
        const foundNodes = searchTree(root, (node) => {
            if (!result.winner) return false;
            return node.data.players!.includes(result.winner);
        });
        if (foundNodes.length === 0) {
            console.log('No nodes found, was searching for ' + result.winner?.name + ' or ' + result.loser?.name + ' in tree');
            continue;
        }
        appendTree(result, foundNodes[0]); // first leave should be children rather than parent
        resultsUsed.push(result);

        printTree(root, (node) => node.data.players!.map(p => p.name).join(' vs '));
    }

    return { rootNode: root, resultsUsed };
}
