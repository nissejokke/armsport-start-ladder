
export interface TreeNode<T> {
    data: T;
    parent?: TreeNode<T>;
    children: TreeNode<T>[];
}

export function appendTree<T>(data: T, parent?: TreeNode<T>): TreeNode<T> {
    const node: TreeNode<T> = {
        data,
        parent,
        children: []
    };

    if (parent)
        parent.children.push(node);
    return node;
}

export function searchTree<T>(parent: TreeNode<T>, fn: (node: TreeNode<T>) => boolean): TreeNode<T>[] {

    const matches: TreeNode<T>[] = [];
    for (const child of parent.children) {
        matches.push(...searchTree(child, fn));
    }

    const hit = fn(parent);
    if (hit) matches.push(parent);

    return matches;
}

export function printTree<T>(parent: TreeNode<T>, format: (node: TreeNode<T>) => string) {
    console.log('[' + format(parent) + (parent.parent ? '' : ' (root)') + '] - [' + parent.children.map(format).join(', ') + ']');
    for (const child of parent.children) {
        printTree(child, format);
    }
}