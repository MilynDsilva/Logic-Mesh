import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { LogicNodeData } from '../types/workflow';

export interface CanvasState {
  nodes: Node<LogicNodeData>[];
  edges: Edge[];
}

export function useUndoRedo(initialState: CanvasState) {
  const [history, setHistory] = useState<CanvasState[]>([initialState]);
  const [pointer, setPointer] = useState(0);

  const takeSnapshot = useCallback((state: CanvasState) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, pointer + 1);
      return [...newHistory, state];
    });
    setPointer((prevPointer) => prevPointer + 1);
  }, [pointer]);

  const undo = useCallback((): CanvasState | null => {
    if (pointer > 0) {
      const newPointer = pointer - 1;
      setPointer(newPointer);
      return history[newPointer];
    }
    return null;
  }, [history, pointer]);

  const redo = useCallback((): CanvasState | null => {
    if (pointer < history.length - 1) {
      const newPointer = pointer + 1;
      setPointer(newPointer);
      return history[newPointer];
    }
    return null;
  }, [history, pointer]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return { takeSnapshot, undo, redo, canUndo, canRedo };
}
