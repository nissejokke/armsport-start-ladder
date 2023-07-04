export interface Player {
    name: string;
}

export interface Match {
    parent?: Match;
    children?: [Match, Match];
    players?: [Player, Player];
    winner?: Player;
    depth?: number;
    isWinnerMatch?: boolean;
}

export interface InitTableArgs {
}

const emptyPlayer: Player = {
    name: '-'
};
const unknownPlayer: Player = {
    name: '?'
};
const pendingMatch: Match = {
    players: [unknownPlayer, unknownPlayer]
};

export function initTable(args: InitTableArgs) {

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
    const startDepth = calcStartDepth();

    let matches: Match[] = [];
    let matchPerDepth: Match[][] = [];
    const shuffledPlayers = [...players]; //shuffle(players);

    function genChildMatch(parent: Match | undefined, players: [Player, Player], depth: number, childIndex: number) {
        const match: Match = {
            parent: parent,
            players: [players[0], players[1]],
            depth
        };
        parent!.children = parent!.children! ?? [unknownPlayer, unknownPlayer];
        parent!.children[childIndex] = match;
        return match;
    }

    const matchQueue: Match[] = [];
    // final
    matchQueue.push({
        players: [unknownPlayer, unknownPlayer],
        depth: startDepth - 1
    });

    while (matchQueue.length) {
        const match = matchQueue.shift()!;
        if (match.depth! < 1) break;
        matchPerDepth[match.depth!] = matchPerDepth[match.depth!] ?? [];
        matchPerDepth[match.depth!].push(match);

        for (let childIndex = 0; childIndex < 2; childIndex++) {
            let playersSelection: [Player, Player];
            if (match.depth === 2) {
                playersSelection = [shuffledPlayers.shift() ?? emptyPlayer, shuffledPlayers.shift() ?? emptyPlayer]; 
                console.log(playersSelection.map(p => p.name));
            } else
                playersSelection = [unknownPlayer, unknownPlayer];
            const childMatch = genChildMatch(match, playersSelection, match.depth! - 1, childIndex);
            matchQueue.push(childMatch);
            console.log(childMatch.players?.map(p => p.name))
        }
    }

    matches = matchPerDepth.flat();

    // winner match (special case)
    const winnerMatch: Match = {
        winner: unknownPlayer,
        parent: undefined,
        isWinnerMatch: true,
    };
    matches[matches.length - 1].parent = winnerMatch;
    matches.push(winnerMatch);
    
    // let depth = startDepth;
    // for (let i = 0; i < startDepth; i++)
    //     matches.push({
    //         players: [shuffledPlayers[i], shuffledPlayers[i + 1]]
    //     });
    // depth = startDepth / 2;
    // for (let i = 0; i < depth; i++)
    //     matches.push(pendingMatch);
    //     depth = startDepth / 2;
    //     for (let i = 0; i < depth; i++)
    //         matches.push(pendingMatch);

    // let matches: Match[] = [
    //     {
    //         players: [players[0], players[1]],            
    //     },
    //     {
    //         players: [players[2], players[3]],            
    //     },
    //     {
    //         players: [players[4], players[5]],            
    //     },
    //     {
    //         players: [players[6], players[7]],            
    //     },

    //     // semi
    //     {
    //         // kent, cronblad
    //         players: [players[0], players[3]],            
    //     },
    //     {
    //         // alex, viktor
    //         players: [players[4], players[6]],            
    //     },

    //     // final
    //     {
    //         // kent, viktor
    //         players: [players[0], players[6]],
    //     },

        
    // ];
    // matches = [matches[0], matches[5], ...matches];
    // // matches = [...matches, ...matches, matches[0]];
    // // matches = [...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches, ...matches];
    // matches.push(
    //     // winner
    //     {
    //         winner: players[0],
    //     }
    // );



    function calcStartDepth() {
        let v = players.length;
        let m = 1;
        while (v / 2 >= 1) {
            v /= 2;
            m++;
        }
        if (v !== 1)
            m++;
        return m;
    }

   renderLadder(matches, startDepth);
}

function takeMatches(matches: Match[], start: number, end: number): Match[] {
    return matches.slice(start, end);
}

function renderLadder(matches: Match[], startDepth: number) {
    const table = document.querySelector('.table')!;
    while (table.childNodes.length)
        table.removeChild(table.childNodes[0]);

    const ladder: HTMLElement[][] = [];

    function renderMatches(colMatches: Match[], depth: number) {
        const cols = generateCols(colMatches, depth, { allMatches: matches, startDepth });
        ladder.unshift(cols);
    }

    let matchesPerCol = 1;
    let currentMatchIndex = matches.length;
    for (let depth = startDepth; depth > 0; depth--) {
        currentMatchIndex -= matchesPerCol;
        const matchSelection = takeMatches(matches, Math.max(currentMatchIndex, 0), currentMatchIndex + matchesPerCol);
        while (matchSelection.length !== matchesPerCol) {
            matchSelection.push({
                players: [emptyPlayer, emptyPlayer]
            });
        }
        // 1, 1, 2, 4
        // 7, 6, 4-5, 0-3, 
        renderMatches(matchSelection, depth);
        if (depth < startDepth)
            matchesPerCol *= 2;
    }

    renderColsAsSingleTable(ladder);
    table.setAttribute('style', `grid-template-columns: repeat(${startDepth}, 1fr)`);
}

function renderColsAsSingleTable(columns: HTMLElement[][]) {
    const table = document.querySelector('.table')!;
    const colCount = columns.length;
    for (let row = 0; row < columns[0].length; row++) {
        for (let col = 0; col < colCount; col++) {
            // let cellToTheTopLeft: HTMLElement | undefined;
            // if (col - 1 >= 0 && row - 1 >= 0)
            //     cellToTheTopLeft = columns[col - 1][row - 1];
            const cell = columns[col][row];
            if (!cell.innerText)
                cell.innerHTML = '&nbsp;';
            // if (cellToTheTopLeft && !cellToTheTopLeft.classList.contains('empty'))
            //     cell.classList.add('left-border');
            table.appendChild(cell);
        }
    }
}

function generateCols(matches: Match[], depth: number, opts: { allMatches: Match[], startDepth: number }): HTMLElement[] {

    const col: HTMLElement[] = [];

    if (depth < 1) throw new Error(`Invalid depth ${depth}, must be >= 1`);

    // generates elements this order:
    // spaces
    // spaces with left border
    // player
    // spaces with left border
    // spaces
    // repeat
    function generateItem({
        player,
        match,
        text, 
        leftBorder, 
        bottomBorder, 
        isEmptyPlayer, 
        canWin 
    }: {
        player?: Player,
        match?: Match,
        text?: string, 
        leftBorder?: boolean, 
        bottomBorder?: boolean, 
        isEmptyPlayer?: boolean, 
        canWin?: boolean
    }): HTMLElement {
        const div = document.createElement('div');
        if (canWin) {
            if (!player) throw new Error('player is required when canWin=true');
            const label = document.createElement('label');
            label.innerText = text ?? '';
            const checkbox = document.createElement('input');
            label.prepend(checkbox);
            checkbox.type = 'checkbox';
            if (match?.parent?.players?.includes(player))
                checkbox.checked = true;
            checkbox.onclick = () => {
                if (!match) throw new Error('match is required');
                if (!match.parent) throw new Error('match parent undefined');
                resetWinnersForParentMatches(match);
                if (match.parent.children) {
                    const childMatchIndex = match.parent.children!.findIndex(child => child === match);
                    console.log('child match index', childMatchIndex)
                    if (childMatchIndex === -1) throw new Error('Couldnt find child');
                    match.parent.players![childMatchIndex] = player!;
                }
                else
                    match.parent.winner = player;
                renderLadder(opts.allMatches, opts.startDepth);
            };
            div.appendChild(label);
        }
        else if (text)
            div.textContent = text;
        if (bottomBorder)
            div.classList.add('border-bottom');
        if (isEmptyPlayer)
            div.classList.add('empty');
        if (leftBorder)
            div.classList.add('border-left');
        return div;
    }

    function drawMatch(match: Match) {
        if (match.winner)
            drawPlayer(match, match.winner);
        else if (match.players) {
            for (const player of match.players!)
                drawPlayer(match, player);
        }
        else throw new Error('Match has not players or winners')
    }

    function drawPlayer(match: Match, player: Player) {
        // spaces
        let spaces;
        if (depth === 1)
            spaces = 0;
        else
            spaces = 2 ** (depth - 2);

        for (let i = 0; i < spaces; i++)
            col.push(generateItem({}));

        // spaces with left border
        let spaces2 = spaces - 1;
        for (let i = 0; i < spaces2; i++)
            col.push(generateItem({ leftBorder: true }));

        // text
        col.push(generateItem({ 
            player,
            match,
            isEmptyPlayer: player === emptyPlayer, 
            canWin: !match.isWinnerMatch && player !== emptyPlayer && player !== unknownPlayer,
            leftBorder: depth > 1, 
            bottomBorder: player !== emptyPlayer, 
            text: player.name 
        }));

        // spaces with left border
        for (let i = 0; i < spaces2 + 1; i++)
            col.push(generateItem({ leftBorder: true }));

        // spaces
        for (let i = 0; i < spaces; i++)
            col.push(generateItem({}));

        if (depth === 1)
            col.push(generateItem({}));
    }

    for (const match of matches)
        drawMatch(match);

    return col;
}

function resetWinnersForParentMatches(match: Match) {
    let iterMatch = match;
    while (iterMatch.parent && !iterMatch.parent.isWinnerMatch) {
        let parent = iterMatch.parent;
        const matchIndex = parent.children!.findIndex(child => child === iterMatch);
        parent.players![matchIndex] = unknownPlayer;
        iterMatch = parent;
    }
    if (iterMatch?.parent?.isWinnerMatch) {
        iterMatch.parent.winner = unknownPlayer;
    }
}

function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }