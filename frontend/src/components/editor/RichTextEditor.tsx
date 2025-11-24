'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

import { useCallback, useRef } from 'react';
import { API_BASE_URL, adminHeaders } from '@/lib/api';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),

    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: adminHeaders(false),
        body: formData
      });

      if (!response.ok) throw new Error('خطا در آپلود');

      const data = await response.json();
      return `${API_BASE_URL}${data.data.url}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const addImageFromUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    const url = await uploadImage(file);
    if (url) {
      // Prompt for image settings
      const width = window.prompt('عرض تصویر (پیکسل، خالی بگذارید برای اندازه اصلی):', '');
      const align = window.prompt('تراز (left/center/right، خالی بگذارید برای پیش‌فرض):', '');

      let style = '';
      if (width) style += `width: ${width}px; `;
      if (align === 'center') style += 'display: block; margin: 0 auto; ';
      else if (align === 'left') style += 'float: left; margin: 0 10px 10px 0; ';
      else if (align === 'right') style += 'float: right; margin: 0 0 10px 10px; ';

      editor.chain().focus().setImage({ 
        src: url,
        ...(style && { style })
      }).run();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImage = useCallback(() => {
    const url = window.prompt('آدرس تصویر را وارد کنید:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('آدرس لینک را وارد کنید:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-3 py-1 text-sm font-bold transition ${
            editor.isActive('bold') ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-3 py-1 text-sm italic transition ${
            editor.isActive('italic') ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-3 py-1 text-sm font-bold transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded px-3 py-1 text-sm font-bold transition ${
            editor.isActive('heading', { level: 3 }) ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-3 py-1 text-sm transition ${
            editor.isActive('bulletList') ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          • لیست
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-3 py-1 text-sm transition ${
            editor.isActive('orderedList') ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          1. لیست
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`rounded px-3 py-1 text-sm transition ${
            editor.isActive('link') ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          🔗 لینک
        </button>
        <button
          type="button"
          onClick={addImageFromUpload}
          className="rounded bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
        >
          📤 آپلود تصویر
        </button>
        <button
          type="button"
          onClick={addImage}
          className="rounded bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          🖼️ لینک تصویر
        </button>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
