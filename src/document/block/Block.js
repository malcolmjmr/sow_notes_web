import { Node } from '@tiptap/core'
import { mergeAttributes } from '@tiptap/core'
import { v4 as uuidV4 } from 'uuid'

export default Node.create({
    name: 'block',
    group: 'block',
    content: 'paragraph+',
    
    addAttributes() {
        return {
            id: { default: null },
            tabCount: { default: 0 }
        }
    },

    addKeyboardShortcuts() {
        return {
            'Enter': ({ editor }) => {
                // const pos = editor.state.selection.$from.pos;
                // const currentNode = editor.state.doc.nodeAt(pos);
                
                // // Create new block with default attributes
                // editor.chain()
                //     .insertContentAt(pos, {
                //         type: 'block',
                //         attrs: {
                //             id: uuidV4(),
                //             tabCount: currentNode?.attrs?.tabCount || 0
                //         },
                //         content: [{
                //             type: 'paragraph',
                //             content: []
                //         }]
                //     })
                //     .focus()
                //     .run();
                
                return true;
            }
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-type="block"]' }]
    },

    renderHTML({ HTMLAttributes, node }) {
        return ['div', mergeAttributes(
            { 'data-type': 'block' },
            { class: 'block' },
            { 'data-active': node.attrs.id === window.activeBlockId },
            { style: `margin-left: ${HTMLAttributes.tabCount * 20}px` },
            HTMLAttributes
        ), 0]
    },

    addNodeView() {
        return ({ node, HTMLAttributes, getPos }) => {
            const dom = document.createElement('div')
            dom.setAttribute('data-type', 'block')
            return {
                dom,
                contentDOM: dom
            }
        }
    }
})