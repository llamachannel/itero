import { Machine, assign } from 'xstate';

function generateTestContext() {
  return {
    currentNodeId: null,
    nodeTitle: '',
    nodeEntry: '',
    nodes: {
      '1': {
        id: 1,
        name: 'foo',
        entries: ['a', 'b', 'c'],
      },
      '2': {
        id: 2,
        name: 'bar',
        entries: ['4', '5' ],
      },
      '4': {
        id: 4,
        name: 'baz',
        entries: ['alpha', 'beta', 'gamma', 'delta']
      }
    },
    displayNodes: [1, 2, 4],
    nodeCursorRowId: 0,
    nodeCursorColId: 0,
  };
}


let createNodeAction = assign(ctxt => {
  let copyNodes = {...ctxt.nodes};
  let existingIds = Object.keys(copyNodes).map(id => parseInt(id));
  let maxId = Math.max(...existingIds);
  let newId = maxId + 1
  let newNodeEntries = ['TODO'];
  let newNodeName = 'New document'

  copyNodes[newId] = {
    id: newId,
    name: newNodeName,
    entries: newNodeEntries,
  };

  console.log(" ++ new node = ", copyNodes[newId]);

  let newDisplayNodes = [...ctxt.displayNodes];
  newDisplayNodes.push(newId);


  return {
    currentNodeId: newId,
    nodeCursorRowId: 0,
    nodeCursorColId: 0,
    nodeTitle: 'New document',
    nodeEntry: newNodeEntries[0],
    nodes: copyNodes,
    displayNodes: newDisplayNodes,
  };
});


let goUpAction = assign(ctxt => {
  let newRowId = ctxt.nodeCursorRowId === 0 ? 0 : ctxt.nodeCursorRowId - 1;
  console.log("(currentNodeId, newRowId) = ", ctxt.currentNodeId, newRowId);
  return {
    nodeCursorRowId: newRowId,
    nodeEntry: ctxt.nodes[ctxt.currentNodeId].entries[newRowId],
  };
});

let goDownAction = assign(ctxt => {
  const numEntries = ctxt.nodes[ctxt.currentNodeId].entries.length;
  let newRowId = ctxt.nodeCursorRowId >= numEntries - 1 ? numEntries - 1 : ctxt.nodeCursorRowId + 1;
  return {
    nodeCursorRowId: newRowId,
    nodeEntry: ctxt.nodes[ctxt.currentNodeId].entries[newRowId],
  };
});

let createEntryBelowAction = assign(ctxt => {
  let nodeCursorRowId = ctxt.nodeCursorRowId;

  // only update nodes if there's a nodeId
  let newNodes;
  newNodes = {...ctxt.nodes};
  let id = ctxt.currentNodeId
  let initialText = 'TODO';
  newNodes[id].entries = [...newNodes[id].entries];
  newNodes[id].entries.splice(nodeCursorRowId+1, 0, initialText);

  console.log("about to create entry below, newNodes = ", newNodes);

  return {
    nodeCursorRowId: nodeCursorRowId + 1,
    nodeEntry: initialText,
    nodes: newNodes,
  };
});


export default (navigateToNodeAction, saveNodeNameAction, saveNodeEntryAction, saveCursorColIdAction) => {

  const nodeStates = {
    states: {
      nodeTitle: {
        on: {},
        initial: 'displaying',
        states: {
          editing: {
            on: {
              SAVE_NODE_NAME: {
                target: 'displaying',
                actions: saveNodeNameAction,
              },
              CANCEL_EDITING_NAME: {
                target: 'displaying',
              },
            },
          },
          displaying: {
            on: {
              START_EDITING_NAME: {
                target: 'editing',
              },
            }
          }
        }
      }
    },
  }

  const flowikiStates = {
    initial: 'top',
    states: {
      top: {
        on: {
          INIT_CREATE_NODE: {
            target: ['node.nodeTitle.editing'],
            actions: createNodeAction,
          },
        },
      },
      node: {
        on: {
          UP: {
            actions: goUpAction
          },
          DOWN: {
            actions: goDownAction
          },
          CREATE_ENTRY_BELOW: {
            actions: createEntryBelowAction,
          },
          SAVE_NODE_ENTRY: {
            actions: saveNodeEntryAction,
          },
          SAVE_CURSOR_COL_ID: {
            actions: saveCursorColIdAction,
          }
        },
        type: 'parallel',
        ...nodeStates
      }
    }
  };

  return Machine({
    id: 'flowiki',
    initial: 'flowiki',
    context: generateTestContext(),
    states: {
      flowiki: {
        on: {
          NAVIGATE: {
            target: 'flowiki.node',
            actions: navigateToNodeAction,
          },
          GO_HOME: {
            target: 'flowiki.top',
          }
        },
        ...flowikiStates
      }
    }

  });
};
