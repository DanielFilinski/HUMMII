/**
 * TAG COMPONENTS
 *
 * Компоненты тегов для отображения статусов задач в проекте Hummii.
 * Основаны на дизайне из макета "Tag task state.jpg".
 *
 * Доступные компоненты:
 * - Tag: Базовый компонент тега (универсальный)
 * - ClaimedTag: Синий тег "Claimed" (задача взята в работу)
 * - DoneTag: Зелёный тег "Done" (задача выполнена)
 * - ReviewedTag: Тёмно-зелёный тег "Reviewed" (задача проверена)
 *
 * @example
 * import { Tag, ClaimedTag, DoneTag, ReviewedTag } from '@/shared/ui/tags';
 *
 * // Использование специализированных компонентов
 * <ClaimedTag />
 * <DoneTag label="Выполнено" />
 * <ReviewedTag size="lg" />
 *
 * // Использование базового компонента
 * <Tag variant="claimed">Claimed</Tag>
 * <Tag variant="done" size="sm">Done</Tag>
 */

export { Tag } from './Tag';
export type { TagVariant, TagSize } from './Tag';

export { ClaimedTag } from './ClaimedTag';
export { DoneTag } from './DoneTag';
export { ReviewedTag } from './ReviewedTag';
