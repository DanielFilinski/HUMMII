import { Tag, ClaimedTag, DoneTag, ReviewedTag } from './index';

/**
 * TAG COMPONENTS EXAMPLES
 *
 * Примеры использования компонентов тегов для различных сценариев.
 */

export function TagExamples() {
  return (
    <div className="p-8 space-y-8 bg-background-primary">
      {/* Специализированные теги с дефолтными текстами */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Специализированные теги (дефолтные)
        </h2>
        <div className="flex flex-wrap gap-4">
          <ClaimedTag />
          <DoneTag />
          <ReviewedTag />
        </div>
      </section>

      {/* Специализированные теги с кастомными текстами */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Специализированные теги (кастомный текст)
        </h2>
        <div className="flex flex-wrap gap-4">
          <ClaimedTag label="В работе" />
          <DoneTag label="Выполнено" />
          <ReviewedTag label="Проверено" />
        </div>
      </section>

      {/* Разные размеры */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Размеры тегов
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-text-secondary">Small (sm)</h3>
            <div className="flex flex-wrap gap-4">
              <ClaimedTag size="sm" />
              <DoneTag size="sm" />
              <ReviewedTag size="sm" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-text-secondary">
              Medium (md) - Default
            </h3>
            <div className="flex flex-wrap gap-4">
              <ClaimedTag size="md" />
              <DoneTag size="md" />
              <ReviewedTag size="md" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-text-secondary">Large (lg)</h3>
            <div className="flex flex-wrap gap-4">
              <ClaimedTag size="lg" />
              <DoneTag size="lg" />
              <ReviewedTag size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Базовый компонент Tag */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Базовый компонент Tag
        </h2>
        <div className="flex flex-wrap gap-4">
          <Tag variant="claimed">Claimed</Tag>
          <Tag variant="done">Done</Tag>
          <Tag variant="reviewed">Reviewed</Tag>
        </div>
      </section>

      {/* Теги с кастомными иконками */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Теги с кастомными иконками
        </h2>
        <div className="flex flex-wrap gap-4">
          <Tag variant="claimed" icon="star">
            Custom Icon
          </Tag>
          <Tag variant="done" icon="bell">
            Custom Icon
          </Tag>
          <Tag variant="reviewed" icon="settings">
            Custom Icon
          </Tag>
        </div>
      </section>

      {/* Теги в списке задач (пример использования) */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Пример: Список задач
        </h2>
        <div className="space-y-3 max-w-md">
          <div className="p-4 bg-background-card rounded-lg flex items-center justify-between">
            <span className="text-text-primary">Fix login bug</span>
            <ClaimedTag size="sm" />
          </div>

          <div className="p-4 bg-background-card rounded-lg flex items-center justify-between">
            <span className="text-text-primary">Update documentation</span>
            <DoneTag size="sm" />
          </div>

          <div className="p-4 bg-background-card rounded-lg flex items-center justify-between">
            <span className="text-text-primary">Implement new feature</span>
            <ReviewedTag size="sm" />
          </div>
        </div>
      </section>

      {/* Теги в карточках */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Пример: Карточки с тегами
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-background-card rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Task #123</h3>
              <ClaimedTag size="sm" />
            </div>
            <p className="text-text-secondary">Description of the task goes here...</p>
          </div>

          <div className="p-6 bg-background-card rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Task #456</h3>
              <DoneTag size="sm" />
            </div>
            <p className="text-text-secondary">Description of the task goes here...</p>
          </div>

          <div className="p-6 bg-background-card rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Task #789</h3>
              <ReviewedTag size="sm" />
            </div>
            <p className="text-text-secondary">Description of the task goes here...</p>
          </div>
        </div>
      </section>

      {/* Теги с дополнительными классами */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Теги с дополнительными стилями
        </h2>
        <div className="flex flex-wrap gap-4">
          <ClaimedTag className="shadow-md hover:shadow-lg transition-shadow" />
          <DoneTag className="opacity-80 hover:opacity-100 transition-opacity" />
          <ReviewedTag className="scale-110 hover:scale-125 transition-transform" />
        </div>
      </section>

      {/* Теги в inline тексте */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Пример: Inline в тексте
        </h2>
        <p className="text-text-primary text-lg">
          The task has been <ClaimedTag size="sm" /> by John, then marked as{' '}
          <DoneTag size="sm" label="completed" />, and finally{' '}
          <ReviewedTag size="sm" /> by the team lead.
        </p>
      </section>
    </div>
  );
}

export default TagExamples;
