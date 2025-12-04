import React from 'react';
import { ChatInput } from '@shared/ui';

/**
 * Пример использования компонента ChatInput
 */
export const ChatInputExample = () => {
  const handleSend = (message: string, file?: File) => {
    console.log('Отправлено сообщение:', message);
    if (file) {
      console.log('Прикреплён файл:', file.name);
    }
    // Здесь можно добавить логику отправки сообщения на сервер
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Базовый пример */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Базовый пример</h3>
        <ChatInput
          placeholder="Напишите сообщение..."
          onSend={handleSend}
        />
      </div>

      {/* Без кнопки прикрепления */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Без прикрепления файлов</h3>
        <ChatInput
          placeholder="Только текст..."
          onSend={handleSend}
          showAttachment={false}
        />
      </div>

      {/* Disabled */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Disabled состояние</h3>
        <ChatInput
          placeholder="Недоступно..."
          onSend={handleSend}
          disabled
        />
      </div>

      {/* С ограничением длины */}
      <div>
        <h3 className="text-lg font-semibold mb-4">С ограничением (200 символов)</h3>
        <ChatInput
          placeholder="Короткое сообщение..."
          onSend={handleSend}
          maxLength={200}
        />
      </div>
    </div>
  );
};
