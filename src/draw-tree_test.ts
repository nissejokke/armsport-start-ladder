import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
    assertSpyCall,
    assertSpyCalls,
    spy,
  } from "https://deno.land/std@0.193.0/testing/mock.ts";
import { TreeDrawing, drawTree } from "./draw-tree.ts";
import { appendTree } from "./tree.ts";
import { MatchResult } from "./play.ts";

Deno.test('simplest tree - depth 1', () => {
    // arrange
    const p1 = { name: 'Totte', wins:[], losses: [], rest: 0 };
    const p2 = { name: 'Kent', wins:[], losses: [], rest: 0 };
    
    const root = appendTree<MatchResult>({ players: [p1, p2], finished: false });
    const lineSpy = spy();
    const drawNameSpy = spy();
    const canvas = {
        line: lineSpy,
        drawName: drawNameSpy
    } as TreeDrawing;

    // act
    drawTree({ node: root, canvas, treeIndex: 0, treeY: 0, onMatchResult: () => {} });

    // assert
    // TODO add more asserts
    assertSpyCall(drawNameSpy, 0, {
        args: [
            {
                x: 145,
                y: 31,
                text: "?",
                cssClass: [],
            },
        ]
    });
});