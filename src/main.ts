export interface Player {
    name: string;
}

export interface Match {
    parents?: [Match, Match];
    players?: [Player, Player];
    winner?: Player;
}

export interface InitTableArgs {
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
    let matches: Match[] = [
        {
            players: [players[0], players[1]],            
        },
        {
            players: [players[2], players[3]],            
        },
        {
            players: [players[4], players[5]],            
        },
        {
            players: [players[6], players[7]],            
        },

        // semi
        {
            // kent, cronblad
            players: [players[0], players[3]],            
        },
        {
            // alex, viktor
            players: [players[4], players[6]],            
        },

        // final
        {
            // kent, viktor
            players: [players[0], players[6]],
        },

        
    ];
    // matches = [...matches, ...matches, matches[0]];
    // matches = [...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches];
    matches.push(
        // winner
        {
            winner: players[0],
        }
    );

    const ladder: HTMLElement[][] = [];

    function renderMatches(matches: Match[], depth: number) {
        const cols = generateCols(matches, depth);
        ladder.unshift(cols);
    }

    function takeMatches(matches: Match[], start: number, end: number): Match[] {
        return matches.slice(start, end);
    }

    function calcStartDepth() {
        let v = matches.length + 1;
        let m = 0;
        while (v / 2 >= 1) {
            v /= 2;
            m++;
        }
        return m + 1;
    }

    let matchesPerCol = 1;
    let currentMatchIndex = matches.length;
    const startDepth = calcStartDepth();
    for (let depth = startDepth; depth > 0; depth--) {
        currentMatchIndex -= matchesPerCol;
        // if (currentMatchIndex < 0) break;
        const matchSelection = takeMatches(matches, currentMatchIndex, currentMatchIndex + matchesPerCol);
        if (matchSelection.length !== matchesPerCol) throw new Error(`Only ${matchSelection.length} matches, expected ${matchesPerCol}, currentMatchIndex=${currentMatchIndex}`);
        // 1, 1, 2, 4
        // 7, 6, 4-5, 0-3, 
        renderMatches(matchSelection, depth);
        if (depth < startDepth)
            matchesPerCol *= 2;
    }

    renderColsAsSingleTable(ladder);
    table.setAttribute('style', `grid-template-columns: repeat(${startDepth}, 1fr)`);
}

function renderColsAsSingleTable(cols: HTMLElement[][]) {
    const table = document.querySelector('.table')!;
    const colCount = cols.length;
    for (let r = 0; r < cols[0].length; r++) {
        for (let c = 0; c < colCount; c++) {
            const cell = cols[c][r];
            if (!cell.innerText)
                cell.innerHTML = '&nbsp;';
            table.appendChild(cell);
        }
    }
}

function generateCols(matches: Match[], depth: number): HTMLElement[] {

    const col: HTMLElement[] = [];

    if (depth < 1) throw new Error(`Invalid depth ${depth}, must be >= 1`);

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
        if (match.winner)
            drawPlayer(match.winner);
        else if (match.players) {
            for (const player of match.players!)
                drawPlayer(player);
        }
        else throw new Error('Match has not players or winners')
    }

    function drawPlayer(player: Player) {
        // spaces
        let spaces;
        if (depth === 1)
            spaces = 0;
        else
            spaces = 2**(depth - 2);

        for (let i = 0; i < spaces; i++)
            col.push(generateItem({}));

        // spaces with left border
        let spaces2 = spaces - 1;
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