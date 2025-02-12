// extensions/Suggestion.js
import { Extension } from '@tiptap/core'

export const Suggestion = Extension.create({
    name: 'suggestion',
    
    addStorage() {
        return {
            suggestion: null,
            position: null
        }
    },
    
    addCommands() {
        return {
            setSuggestion: (suggestion) => ({ editor }) => {
                editor.storage.suggestion.suggestion = suggestion
                return true
            },
            clearSuggestion: () => ({ editor }) => {
                editor.storage.suggestion.suggestion = null
                return true
            }
        }
    }
})