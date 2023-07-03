import { TableNode } from './dist/table-node.js';

export interface Player {
    name: string;
}

export interface Match {
    parents?: [Match, Match];
    players?: [Player, Player];
    winner?: Player;
}

export interface InitTableArgs {
    // players: Player;
    final?: Match;
}

export function initTable(args: InitTableArgs) {

    const table = document.querySelector('.table')!;

    const names = [
        'Kent Andersson',
        'Totte',
        'Palten',
        'Cronblad',
        'Alex',
        'Strumpan',
        'Viktor',
        'Dagblad'
    ];
    const players: Player[] = names.map(name => ({ name }));
    const matches: Match[] = [
        {
            players: [players[0], players[1]],            
            winner: players[0]
        },
        {
            players: [players[2], players[3]],            
            winner: players[3]
        },
        {
            players: [players[4], players[5]],            
            winner: players[4]
        },
        {
            players: [players[6], players[7]],            
            winner: players[6]
        },

        // semi
        {
            // kent, cronblad
            players: [players[0], players[3]],            
            winner: players[0]
        },
        {
            // alex, viktor
            players: [players[4], players[6]],            
            winner: players[6]
        },

        // final
        {
            // kent, viktor
            players: [players[0], players[6]],
            winner: players[0]
        },
    ];

    // matches[6].parents = [matches[]

    const currentMatchIndex = 6;
    const currentMatch = matches[currentMatchIndex];

    const col1 = generateCols([currentMatch], 3);
    console.log(col1);
    
    
    console.log('-----')
    const parentMatches = [matches[currentMatchIndex - 2], matches[currentMatchIndex - 1]];
    const col2 = generateCols(parentMatches, 2);
    console.log(col2);

    console.log('-----')
    const parentMatches2 = [matches[0], matches[1], matches[2], matches[3]];
    const col3 = generateCols(parentMatches2, 1);
    console.log(col3);

    renderCols([col3, col2, col1]);

    // const final: Match = {
    //     matches: [{
    //         players: [players[0], players[1]],            
    //     }]
    //     winner: kent,
    // }

}

function renderCols(cols: HTMLElement[][]) {
    const table = document.querySelector('.table')!;
    for (const col of cols) {
        const colContainer = document.createElement('div');
        colContainer.classList.add('col');
        for (const row of col) {
            if (!row.innerText)
                row.innerHTML = '&nbsp;';
            colContainer.appendChild(row);
        }
        table.appendChild(colContainer);
    }

}

function generateCols(matches: Match[], depth: number): HTMLElement[] {

    const col: HTMLElement[] = [];

    // gen order:
    // spaces
    // spaces with left border
    // player
    // spaces with left border
    // spaces
    // repeat
    function generateItem({text, leftBorder, bottomBorder}: {text?: string, leftBorder?: boolean, bottomBorder?: boolean}): HTMLElement {
        const div = document.createElement('div');
        if (text)
            div.textContent = text;
        if (bottomBorder)
            div.classList.add('bbottom');
        if (leftBorder)
            div.classList.add('bleft');
        return div;
    }

    function drawMatch(match: Match) {
        for (const player of match.players!)
            drawPlayer(player);
    }

    function drawPlayer(player: Player) {
        // spaces
        let spaces;
        if (depth === 3)
            spaces = 2;
        else if (depth === 2)
            spaces = 1;
        else if (depth === 1)
            spaces = 0;
        for (let i = 0; i < spaces; i++)
            col.push(generateItem({}));

        // spaces with left border
        let spaces2;
        if (depth === 3)
            spaces2 = 1;
        else if (depth === 2)
            spaces2 = 0;
        else if (depth === 1)
            spaces2 = -1;
        for (let i = 0; i < spaces2; i++)
            col.push(generateItem({ leftBorder: true }));

        // text
        col.push(generateItem({ leftBorder: depth > 1, bottomBorder: true, text: player?.name }));

        // spaces with left border
        for (let i = 0; i < spaces2 + 1; i++)
            col.push(generateItem({ leftBorder: true }));

        for (let i = 0; i < spaces; i++)
            col.push(generateItem({}));

        if (depth === 1)
            col.push(generateItem({}));
    }

    for (const match of matches)
        drawMatch(match);

    return col;
}