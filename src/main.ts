import { TableNode } from './dist/table-node.js';

export interface Player {
    name: string;
}

export interface InitTableArgs {
    players: Player;
}

export function initTable(args: InitTableArgs) {

    const table = document.querySelector('.table')!;
    const row = document.createElement('div');
    row.classList.add('col');
    const tableNode = document.createElement('table-node');
    tableNode.setAttribute('player1', 'Kent Andersson');
    tableNode.setAttribute('player2', 'Totte');
    row.appendChild(tableNode);

    const tableNode2 = document.createElement('table-node');
    tableNode2.setAttribute('player1', 'Palten');
    tableNode2.setAttribute('player2', 'Jonna');
    row.appendChild(tableNode2);

    table.appendChild(row);

    const row2 = document.createElement('div');
    row2.classList.add('col');
    const tableNode3 = document.createElement('table-node');
    tableNode3.setAttribute('player1', 'Kent Andersson');
    tableNode3.setAttribute('player2', 'Palten');
    tableNode3.setAttribute('depth', '1');
    row2.appendChild(tableNode3);
    table.appendChild(row2);


}