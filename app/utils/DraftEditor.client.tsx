import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {CompositeDecorator, ContentBlock, ContentState, convertToRaw, DraftEditorCommand, Editor, EditorState, getDefaultKeyBinding, Modifier, RichUtils} from "draft-js";
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

function findLinkEntities(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
    block.findEntityRanges((char) => {
        const key = char.getEntity();
        return key !== null && contentState.getEntity(key).getType() === "LINK";
    }, callback);
}

export function LinkEntity({contentState, entityKey, children}: {contentState: ContentState, entityKey: string, children: ReactNode}) {
    const { url } = contentState.getEntity(entityKey).getData() as { url: string };
    
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
            {children}
        </a>
    );
}

function normalizeUrl(u: string) {
    const t = u.trim();
    if (!t) return t;
    return /^https?:\/\//i.test(t) ? t :`https://${t}`;
}

function isLikelyUrl(text: string) {
    return /^(https?:\/\/|www\.)[^\s]+$/i.test(text.trim());
}

export default function DraftEditorClient({onChange}: {onChange: (value: string) => void}) {
    const decorator = useMemo(() => new CompositeDecorator([
        { strategy: findLinkEntities, component: LinkEntity },
    ]), []);

    const [editorState, setEditorState] = useState(() => EditorState.createEmpty(decorator));

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

    const addLink = useCallback(() => {
        const sel = editorState.getSelection();
        if (sel.isCollapsed()) return;

        const block = editorState.getCurrentContent().getBlockForKey(sel.getStartKey());
        if (block.getType() === "code-block") return;

        let url = window.prompt("Enter URL");
        if (!url) return;
        url = normalizeUrl(url);
        if (!url) return;

        const content = editorState.getCurrentContent();
        const contentWithEntity = content.createEntity("LINK", "MUTABLE", { url });
        const entityKey = contentWithEntity.getLastCreatedEntityKey();
        const withEntityState = EditorState.set(editorState, { currentContent: contentWithEntity });

        setEditorState(RichUtils.toggleLink(withEntityState, sel, entityKey));
    }, [editorState]);

    const removeLink = useCallback(() => {
        const sel = editorState.getSelection();
        if (sel.isCollapsed()) return;
        setEditorState(RichUtils.toggleLink(editorState, sel, null));
    }, [editorState]);

    const keyBindingFn = useCallback((e: React.KeyboardEvent): DraftEditorCommand | null => {
        const isMod = e.metaKey || e.ctrlKey;
        const k = e.key.toLowerCase();

        if (isMod && k === "u") return "underline";
        if (isMod && k === "k" && e.shiftKey) return "remove-link" as unknown as DraftEditorCommand;
        if (isMod && k === "k") return "add-link" as unknown as DraftEditorCommand;

        return getDefaultKeyBinding(e as any);
    }, []);

    const handleKeyCommand = useCallback((command: DraftEditorCommand, state: EditorState) => {
        const cmd = command as unknown as string;

        if (cmd === "underline") {
            setEditorState(RichUtils.toggleInlineStyle(state, "UNDERLINE"));
            return "handled";
        }

        if (cmd === "add-link") {
            addLink();
            return "handled";
        }

        if (cmd === "remove-link") {
            removeLink();
            return "handled";
        }

        const next = RichUtils.handleKeyCommand(state, command);
        if (next) {
            setEditorState(next);
            return "handled";
        }
        return "not-handled";
    }, [addLink, removeLink]);

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

    const handlePastedText = useCallback((text: string, _html?: string, state?: EditorState) => {
        if (!state) return "not-handled";
        if (!isLikelyUrl(text)) return "not-handled";
        
        const url = normalizeUrl(text);
        const current = state.getCurrentContent();
        const withEntityContent = current.createEntity("LINK", "MUTABLE", { url });
        const entityKey = withEntityContent.getLastCreatedEntityKey();
        const withEntity = EditorState.set(state, { currentContent: withEntityContent });
        const newContent = Modifier.replaceText(
            withEntity.getCurrentContent(),
            withEntity.getSelection(),
            text,
            state.getCurrentInlineStyle(),
            entityKey
        );

        setEditorState(EditorState.push(withEntity, newContent, "insert-characters"));
        return "handled";
    }, []);

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
                <StyleButton label="Link" title="Add link (⌘/Ctrl+K)" active={false} onToggle={addLink} />
                <StyleButton label="Unlink" title="Remove link (⌘/Ctrl+⇧+K)" active={false} onToggle={removeLink} />
        
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