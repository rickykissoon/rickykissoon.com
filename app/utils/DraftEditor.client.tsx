import { useCallback, useEffect, useMemo, useState } from "react";
import {convertToRaw, DraftEditorCommand, Editor, EditorState, getDefaultKeyBinding, Modifier, RichUtils} from "draft-js";
import "draft-js/dist/Draft.css";

const INLINE_STYLES = [
    {label: "B", style: "BOLD", title: "BOLD"},
    {label: "I", style: "ITALIC", title: "Italic"},
    {label: "U", style: "UNDERLINE", title: "Underline"},
    {label: "Code", style: "CODE", title: "Inline code"},
];

const BLOCK_TYPES = [
    {label: "P", style: "unstyled", title: "Paragraph"},
    {label: "H1", style: "header-one", title: "Heading 1"},
    {label: "H2", style: "header-two", title: "Heading 2"},
    {label: "UL", style: "unordered-list-item", title: "Bulleted list"},
    {label: "OL", style: "ordered-list-item", title: "Numbered list"},
    {label: "''", style: "blockquote", title: "Blockquote"},
    {label: "{}", style: "code-block", title: "Code Block"},
];

const customStyleMap = {
    CODE: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", background: "rgba(0,0,0,0.05)", padding: "0 .25rem", borderRadius: 3 }
};

function StyleButton({active, label, title, onToggle}: {active:boolean; label:string; title?:string; onToggle:()=>void}) {
    return (
      <button
        type="button"
        onMouseDown={(e)=>{ e.preventDefault(); onToggle(); }}
        title={title}
        style={{
          padding: "2px 6px", marginRight: 6, borderRadius: 2,
          border: active ? "1px solid #333" : "1px solid #480d02",
          background: active ? "#ff4f30" : "#290701", cursor: "pointer",
          color: active ? "#290701" : "#ff4f30"
        }}
      >
        {label}
      </button>
    );
}

export default function DraftEditorClient({onChange}: {onChange: (value: string) => void}) {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    useEffect(() => {
        console.log("[DraftEditor] mounted");
        return () => console.log("[DraftEditor] unmounted");
    }, []);

    useEffect(() => {
        const raw = convertToRaw(editorState.getCurrentContent());
        onChange(JSON.stringify(raw));
    }, [editorState, onChange]);

    const toggleInline = useCallback((style: string) => {
        setEditorState(s => RichUtils.toggleInlineStyle(s, style as any));
    }, []);

    const toggleBlock = useCallback((blockType: string) => {
        setEditorState(s => RichUtils.toggleBlockType(s, blockType as any));
    }, []);

    const currentInline = editorState.getCurrentInlineStyle();
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const blockType = useMemo(() => {
        const block = content.getBlockForKey(selection.getStartKey());
        return block.getType();
    }, [content, selection]);

    const keyBindingFn = useCallback((e: React.KeyboardEvent): DraftEditorCommand | null => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "u") return "underline";
        return getDefaultKeyBinding(e as any);
    }, []);

    const handleKeyCommand = useCallback((command: DraftEditorCommand, state: EditorState) => {
        if (command === "underline") {
            setEditorState(RichUtils.toggleInlineStyle(state, "UNDERLINE"));
            return "handled";
        }

        const next = RichUtils.handleKeyCommand(state, command);
        if (next) {
            setEditorState(next);
            return "handled";
        }
        return "not-handled";
    }, []);

    const handleReturn = useCallback((e: React.KeyboardEvent, state: EditorState): "handled" | "not-handled" => {
        const sel = state.getSelection();
        const content = state.getCurrentContent();
        const block = content.getBlockForKey(sel.getStartKey());
        const type = block.getType();

        if (type === "code-block") {
            setEditorState(RichUtils.insertSoftNewline(state));
            return "handled";
        }

        const isEmpty = block.getText().length === 0 && type === "unstyled";

        if (isEmpty) {
            setEditorState(RichUtils.insertSoftNewline(state));
            return "handled";
        }

        return "not-handled";
    }, []);

    const onTab = useCallback((e: React.KeyboardEvent) => {
        const sel = editorState.getSelection();
        const block = editorState.getCurrentContent().getBlockForKey(sel.getStartKey());
        const isCode = block.getType() === "code-block";

        if (isCode) {
            e.preventDefault();
            const contentWithTab = Modifier.insertText(
                editorState.getCurrentContent(),
                sel,
                "\t"
            );
            setEditorState(EditorState.push(editorState, contentWithTab, "insert-characters"));
            return;
        }

        setEditorState(RichUtils.onTab(e as any, editorState, 2));
    }, [editorState]);

    return(
        <div>
            <div style={{display: "flex", alignItems: "center", gap:8, marginBottom: 8}}>
                {INLINE_STYLES.map(s => (
                    <StyleButton
                        key={s.style}
                        label={s.label}
                        title={s.title}
                        active={currentInline.has(s.style)}
                        onToggle={() => toggleInline(s.style)}
                    />
                ))}
                <span style={{width: 1, height: 20, background: "#ddd"}} />
                {BLOCK_TYPES.map(b => (
                    <StyleButton
                        key={b.style}
                        label={b.label}
                        title={b.title}
                        active={blockType === b.style}
                        onToggle={() => toggleBlock(b.style)}
                    />
                ))}
            </div>
        
            <div style={{border: "1px solid #DDD", padding: 8, minHeight: 120}}>
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    keyBindingFn={keyBindingFn}
                    handleKeyCommand={handleKeyCommand}
                    handleReturn={handleReturn}
                    onTab={onTab}
                    customStyleMap={customStyleMap}
                    placeholder="Type here..."
                    spellCheck
                />
            </div>
        </div>
    );
}