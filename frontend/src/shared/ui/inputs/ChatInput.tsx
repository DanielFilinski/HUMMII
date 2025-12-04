import { useState, useRef, KeyboardEvent, ChangeEvent, FC } from 'react';
import { Icon } from '@shared/ui/icons';
import { cn } from '@shared/lib/utils';

export interface ChatInputProps {
  /**
   * Placeholder текст
   */
  placeholder?: string;
  /**
   * Callback при отправке сообщения
   */
  onSend: (message: string, file?: File) => void;
  /**
   * Disabled состояние
   */
  disabled?: boolean;
  /**
   * Показывать ли кнопку прикрепления файла
   */
  showAttachment?: boolean;
  /**
   * Максимальная длина сообщения
   */
  maxLength?: number;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  /**
   * Auto-focus при монтировании
   */
  autoFocus?: boolean;
}

/**
 * ChatInput - компонент для ввода сообщений в чате
 * 
 * Особенности:
 * - Автоматическое изменение высоты при вводе текста
 * - Поддержка прикрепления файлов
 * - Отправка по Enter (Shift+Enter для новой строки)
 * - Адаптивный дизайн
 * 
 * @example
 * ```tsx
 * <ChatInput
 *   placeholder="Введите сообщение..."
 *   onSend={(message, file) => console.log(message, file)}
 *   showAttachment={true}
 * />
 * ```
 */
export const ChatInput: FC<ChatInputProps> = ({
  placeholder = 'Введите сообщение...',
  onSend,
  disabled = false,
  showAttachment = true,
  maxLength = 5000,
  className,
  autoFocus = false,
}) => {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Автоматическое изменение высоты textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    if (message.trim() || attachedFile) {
      onSend(message.trim(), attachedFile || undefined);
      setMessage('');
      setAttachedFile(null);
      
      // Сброс высоты textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter без Shift - отправка
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const canSend = (message.trim() || attachedFile) && !disabled;

  return (
    <div className={cn('w-full', className)}>
      {/* Превью прикрепленного файла */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 px-4 py-2 bg-surface-sunken border border-border-secondary rounded-lg">
          <Icon name="clip" size="sm" color="secondary" />
          <span className="text-text-secondary text-sm flex-1 truncate">
            {attachedFile.name}
          </span>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Удалить файл"
          >
            <Icon name="x" size="sm" color="current" />
          </button>
        </div>
      )}

      {/* Основной инпут */}
      <div className="relative flex items-end gap-2 p-3 bg-background-card rounded-2xl shadow-sm">
        {/* Скрытый input для файлов */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* Textarea для ввода текста */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          rows={1}
          className={cn(
            'flex-1 resize-none overflow-hidden',
            'bg-transparent border-0 outline-none',
            'text-text-primary placeholder:text-text-tertiary',
            'text-base leading-6',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:border-0 focus:ring-0'
          )}
          style={{
            minHeight: '24px',
            maxHeight: '120px',
          }}
        />

        {/* Кнопка прикрепления файла справа */}
        {showAttachment && (
          <button
            type="button"
            onClick={handleAttachmentClick}
            disabled={disabled}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-all',
              'hover:bg-surface-hover active:bg-surface-pressed',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary/30'
            )}
            aria-label="Прикрепить файл"
          >
            <Icon name="clip" size="md" color="secondary" />
          </button>
        )}
      </div>
    </div>
  );
};
