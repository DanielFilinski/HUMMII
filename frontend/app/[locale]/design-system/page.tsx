'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Checkbox,
  Container,
  Input,
  Radio,
  SearchInput,
  Select,
  Spinner,
  Textarea,
  Toggle,
  Typography,
} from '@/components/ui';
import { colors, gradients } from '@/lib/design-tokens';
import { Header } from '@/components/ui/header/Header';

export default function DesignSystemShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <div className="min-h-screen bg-background-3 py-12">
      <Container maxWidth="2xl">
        {/* Logo and Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-4">
              <Typography as="h1" variant="h1" className="text-accent-1">
                HUMMII
              </Typography>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-1">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-10 w-10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <Typography as="h2" variant="h2" className="mb-4">
            Component Library
          </Typography>
          <Typography variant="body" color="secondary">
            Комплексный обзор всех токенов дизайна и компонентов
          </Typography>
        </div>

        <div className="space-y-16">
          {/* Header Variants Section */}
          
            <Header/>
          
         

          {/* Colors Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Цветовая палитра
            </Typography>

            {/* Backgrounds */}
            <div className="mb-8">
              <Typography as="h3" variant="h3" className="mb-4">
                Фоновые цвета
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(colors.background).map(([key, value]) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-text-unfocused/20 shadow"
                  >
                    <div
                      className="h-24 w-full"
                      style={{ backgroundColor: value }}
                    />
                    <div className="bg-background-1 p-3">
                      <Typography variant="bodySm" weight="semibold">
                        Background {key}
                      </Typography>
                      <Typography variant="note" color="secondary">
                        {value}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Colors */}
            <div className="mb-8">
              <Typography as="h3" variant="h3" className="mb-4">
                Цвета текста
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(colors.text).map(([key, value]) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-text-unfocused/20 shadow"
                  >
                    <div
                      className="h-24 w-full"
                      style={{ backgroundColor: value }}
                    />
                    <div className="bg-background-1 p-3">
                      <Typography variant="bodySm" weight="semibold">
                        Text {key}
                      </Typography>
                      <Typography variant="note" color="secondary">
                        {value}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div className="mb-8">
              <Typography as="h3" variant="h3" className="mb-4">
                Акцентные цвета
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Object.entries(colors.accent).map(([key, value]) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-text-unfocused/20 shadow"
                  >
                    <div
                      className="h-24 w-full"
                      style={{ backgroundColor: value }}
                    />
                    <div className="bg-background-1 p-3">
                      <Typography variant="bodySm" weight="semibold">
                        Accent {key}
                      </Typography>
                      <Typography variant="note" color="secondary">
                        {value}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Colors */}
            <div>
              <Typography as="h3" variant="h3" className="mb-4">
                Цвета обратной связи
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Object.entries(colors.feedback).map(([key, value]) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-text-unfocused/20 shadow"
                  >
                    <div
                      className="h-24 w-full"
                      style={{ backgroundColor: value }}
                    />
                    <div className="bg-background-1 p-3">
                      <Typography variant="bodySm" weight="semibold">
                        {key}
                      </Typography>
                      <Typography variant="note" color="secondary">
                        {value}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Типографика
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography as="h1" variant="h1">
                    Заголовок 1 - Съешь ещё этих мягких французских булок
                  </Typography>
                </div>
                <div>
                  <Typography as="h2" variant="h2">
                    Заголовок 2 - Съешь ещё этих мягких французских булок
                  </Typography>
                </div>
                <div>
                  <Typography as="h3" variant="h3">
                    Заголовок 3 - Съешь ещё этих мягких французских булок
                  </Typography>
                </div>
                <div>
                  <Typography variant="body">
                    Основной текст - Съешь ещё этих мягких французских булок.
                    Это стандартный стиль текста, используемый для основного
                    содержимого в приложении.
                  </Typography>
                </div>
                <div>
                  <Typography variant="bodySm">
                    Малый текст - Съешь ещё этих мягких французских булок.
                    Используется для второстепенного контента и описаний.
                  </Typography>
                </div>
                <div>
                  <Typography variant="tag">
                    ТЕКСТ ТЕГА - Для бейджей и меток
                  </Typography>
                </div>
                <div>
                  <Typography variant="note" color="secondary">
                    Дополнительные заметки - Мелкий текст для подсказок
                  </Typography>
                </div>
              </div>
            </Card>
          </section>

          {/* Buttons Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Кнопки
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Варианты
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Основная кнопка</Button>
                    <Button variant="secondary">Вторичная кнопка</Button>
                    <Button variant="link">Кнопка-ссылка</Button>
                    <Button variant="icon">🔍</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Состояния (Default → Hovered → Pressed → Disabled)
                  </Typography>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex flex-col gap-2">
                      <Typography variant="bodySm" color="secondary">
                        Default
                      </Typography>
                      <Button>Default</Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography variant="bodySm" color="secondary">
                        Hovered
                      </Typography>
                      <Button className="hover:bg-accent-2">Hovered</Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography variant="bodySm" color="secondary">
                        Pressed
                      </Typography>
                      <Button className="scale-95 bg-accent-2">
                        Pressed
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography variant="bodySm" color="secondary">
                        Disabled
                      </Typography>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Размеры
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Маленькая</Button>
                    <Button size="md">Средняя</Button>
                    <Button size="lg">Большая</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Состояния загрузки
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button>Обычная</Button>
                    <Button isLoading>Загрузка</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Полная ширина
                  </Typography>
                  <Button fullWidth>Кнопка на всю ширину</Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Inputs Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Поля ввода
            </Typography>
            <Card padding="lg">
              <div className="grid gap-6 lg:grid-cols-2">
                <Input label="Default" placeholder="Placeholder" />
                <Input label="Filled" value="Заполненное значение" readOnly />
                <Input
                  label="Пароль"
                  type="password"
                  placeholder="••••••••"
                  hint="Минимум 8 символов"
                />
                <Input
                  label="С ошибкой"
                  placeholder="Введите значение"
                  error="Это поле обязательно"
                />
                <Input
                  label="Отключено"
                  placeholder="Отключенное поле"
                  disabled
                />
                <Input label="Email" placeholder="your@email.com" />
              </div>
            </Card>
          </section>

          {/* Text Area Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Text Area
            </Typography>
            <Card padding="lg">
              <div className="space-y-4">
                <Textarea
                  label="Описание"
                  placeholder="Введите подробное описание..."
                  hint="Максимум 500 символов"
                  showCharCount
                  maxLength={500}
                />
                <Textarea
                  label="Комментарий"
                  placeholder="Ваш комментарий"
                  disabled
                />
              </div>
            </Card>
          </section>

          {/* Checkbox Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Checkbox
            </Typography>
            <Card padding="lg">
              <div className="space-y-4">
                <Checkbox
                  label="Я согласен с условиями использования"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <Checkbox label="Получать уведомления по email" />
                <Checkbox label="Запомнить меня" checked readOnly />
                <Checkbox label="Отключенный чекбокс" disabled />
              </div>
            </Card>
          </section>

          {/* Radio Buttons Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Radio Buttons
            </Typography>
            <Card padding="lg">
              <Typography variant="bodySm" className="mb-3">
                Выберите один вариант:
              </Typography>
              <div className="space-y-4">
                <Radio
                  label="Вариант 1"
                  name="radio-group"
                  value="option1"
                  checked={radioValue === 'option1'}
                  onChange={(e) => setRadioValue(e.target.value)}
                />
                <Radio
                  label="Вариант 2"
                  name="radio-group"
                  value="option2"
                  checked={radioValue === 'option2'}
                  onChange={(e) => setRadioValue(e.target.value)}
                />
                <Radio
                  label="Вариант 3"
                  name="radio-group"
                  value="option3"
                  checked={radioValue === 'option3'}
                  onChange={(e) => setRadioValue(e.target.value)}
                />
                <Radio label="Отключенный вариант" disabled />
              </div>
            </Card>
          </section>

          {/* Toggle Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Toggle
            </Typography>
            <Card padding="lg">
              <div className="space-y-4">
                <Toggle
                  label="Включить уведомления"
                  checked={toggleValue}
                  onChange={(e) => setToggleValue(e.target.checked)}
                />
                <Toggle label="Темная тема" />
                <Toggle label="Публичный профиль" checked readOnly />
                <Toggle label="Отключенный переключатель" disabled />
              </div>
            </Card>
          </section>

          {/* Search Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Search
            </Typography>
            <Card padding="lg">
              <SearchInput
                placeholder="Поиск по категориям..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue('')}
                fullWidth
              />
            </Card>
          </section>

          {/* Dropdown Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Dropdown
            </Typography>
            <Card padding="lg">
              <div className="grid gap-6 lg:grid-cols-2">
                <Select
                  label="Выберите категорию"
                  options={[
                    { value: '', label: 'Выберите категорию' },
                    { value: 'cleaning', label: 'Уборка' },
                    { value: 'repair', label: 'Ремонт' },
                    { value: 'design', label: 'Дизайн' },
                  ]}
                />
                <Select
                  label="Статус заказа"
                  options={[
                    { value: 'pending', label: 'В ожидании' },
                    { value: 'active', label: 'Активный' },
                    { value: 'completed', label: 'Завершен' },
                  ]}
                  disabled
                />
              </div>
            </Card>
          </section>

          {/* Badges Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Бейджи
            </Typography>
            <Card padding="lg">
              <div className="space-y-4">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Варианты
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">Успешно</Badge>
                    <Badge variant="warning">Предупреждение</Badge>
                    <Badge variant="error">Ошибка</Badge>
                    <Badge variant="info">Информация</Badge>
                    <Badge variant="neutral">Нейтральный</Badge>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Размеры
                  </Typography>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm">Маленький</Badge>
                    <Badge size="md">Средний</Badge>
                    <Badge size="lg">Большой</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Cards Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Карточки
            </Typography>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Стандартная карточка</CardTitle>
                  <CardDescription>
                    Это стандартная карточка с базовым оформлением
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    Содержимое карточки размещается здесь. Может включать любой
                    тип контента.
                  </Typography>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Действие</Button>
                </CardFooter>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Карточка с градиентом</CardTitle>
                  <CardDescription>
                    Карточка с красивым градиентным фоном
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    Градиент создает тонкий визуальный эффект.
                  </Typography>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Действие</Button>
                </CardFooter>
              </Card>

              <Card variant="outlined" hoverable>
                <CardHeader>
                  <CardTitle>Карточка с обводкой</CardTitle>
                  <CardDescription>
                    Наведите на карточку, чтобы увидеть эффект
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    Эта карточка реагирует на наведение и имеет стиль обводки.
                  </Typography>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Действие</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Avatars Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Аватары
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Размеры
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar size="xs" fallback="XS" />
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" />
                    <Avatar size="lg" fallback="LG" />
                    <Avatar size="xl" fallback="XL" />
                    <Avatar size="xl" fallback="2XL" />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Формы
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar shape="circle" fallback="ИФ" />
                    <Avatar shape="square" fallback="ИФ" />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Статус онлайн
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar fallback="ОН" online />
                    <Avatar fallback="ОФ" online={false} />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Группа аватаров
                  </Typography>
                  <AvatarGroup max={4}>
                    <Avatar fallback="ИП" />
                    <Avatar fallback="СМ" />
                    <Avatar fallback="АБ" />
                    <Avatar fallback="КД" />
                    <Avatar fallback="ЕФ" />
                    <Avatar fallback="ГХ" />
                  </AvatarGroup>
                </div>
              </div>
            </Card>
          </section>

          {/* Loading States Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Состояния загрузки
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Размеры
                  </Typography>
                  <div className="flex flex-wrap items-center gap-6">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner size="xl" />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    С надписью
                  </Typography>
                  <Spinner label="Загрузка..." />
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Варианты
                  </Typography>
                  <div className="flex flex-wrap gap-6">
                    <Spinner variant="accent" />
                    <Spinner variant="secondary" />
                    <div className="rounded-lg bg-accent-1 p-4">
                      <Spinner variant="inverse" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Gradients Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Градиенты
            </Typography>
            <div className="grid gap-6 lg:grid-cols-3">
              {Object.entries(gradients).map(([key, value]) => (
                <div
                  key={key}
                  className="overflow-hidden rounded-xl border border-text-unfocused/20 shadow"
                >
                  <div className="h-48 w-full" style={{ background: value }} />
                  <div className="bg-background-1 p-4">
                    <Typography variant="bodySm" weight="semibold">
                      {key.charAt(0).toUpperCase() + key.slice(1)} градиент
                    </Typography>
                    <Typography variant="note" color="secondary">
                      {value}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Categories
            </Typography>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Cleaning */}
              <Card hoverable variant="gradient" padding="lg">
                <div className="flex flex-col gap-3">
                  <div className="text-4xl">🧹</div>
                  <Typography variant="h3">Cleaning</Typography>
                  <Typography variant="bodySm" color="secondary">
                    Professional cleaning services
                  </Typography>
                </div>
              </Card>

              {/* Pet Services */}
              <Card hoverable variant="gradient" padding="lg">
                <div className="flex flex-col gap-3">
                  <div className="text-4xl">🐕</div>
                  <Typography variant="h3">Pet Services</Typography>
                  <Typography variant="bodySm" color="secondary">
                    Care for your pets
                  </Typography>
                </div>
              </Card>

              {/* Events */}
              <Card hoverable variant="gradient" padding="lg">
                <div className="flex flex-col gap-3">
                  <div className="text-4xl">🎉</div>
                  <Typography variant="h3">Events</Typography>
                  <Typography variant="bodySm" color="secondary">
                    Event planning & organization
                  </Typography>
                </div>
              </Card>

              {/* Home Services */}
              <Card hoverable variant="gradient" padding="lg">
                <div className="flex flex-col gap-3">
                  <div className="text-4xl">🏠</div>
                  <Typography variant="h3">Home Services</Typography>
                  <Typography variant="bodySm" color="secondary">
                    Repairs and maintenance
                  </Typography>
                </div>
              </Card>
            </div>
          </section>

          {/* Contractor Cards Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Contractor Cards
            </Typography>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card hoverable>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar size="xl" fallback="ИП" online />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Typography variant="h3">Иван Петров</Typography>
                          <Typography variant="bodySm" color="secondary">
                            Профессиональный подрядчик
                          </Typography>
                        </div>
                        <Badge variant="success">Проверен</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              ★
                            </span>
                          ))}
                        </div>
                        <Typography variant="bodySm" color="secondary">
                          4.9 (127 отзывов)
                        </Typography>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm" className="mb-3">
                    Опытный специалист по ремонту и строительству. Более 10 лет
                    опыта работы с жилыми и коммерческими объектами.
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info" size="sm">
                      Строительство
                    </Badge>
                    <Badge variant="info" size="sm">
                      Ремонт
                    </Badge>
                    <Badge variant="info" size="sm">
                      Дизайн
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Посмотреть профиль</Button>
                  <Button variant="secondary" size="sm">
                    Написать
                  </Button>
                </CardFooter>
              </Card>

              <Card hoverable>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar size="xl" fallback="МС" online />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Typography variant="h3">Мария Сидорова</Typography>
                          <Typography variant="bodySm" color="secondary">
                            Дизайнер интерьеров
                          </Typography>
                        </div>
                        <Badge variant="success">Проверен</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              ★
                            </span>
                          ))}
                        </div>
                        <Typography variant="bodySm" color="secondary">
                          5.0 (89 отзывов)
                        </Typography>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm" className="mb-3">
                    Создаю уютные и функциональные пространства. Индивидуальный
                    подход к каждому проекту.
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info" size="sm">
                      Дизайн
                    </Badge>
                    <Badge variant="info" size="sm">
                      3D визуализация
                    </Badge>
                    <Badge variant="info" size="sm">
                      Декор
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Посмотреть профиль</Button>
                  <Button variant="secondary" size="sm">
                    Написать
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Order Overview Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Order Overview
            </Typography>
            <div className="grid gap-6">
              {/* Active Order */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Ремонт ванной комнаты</CardTitle>
                      <CardDescription>
                        Заказ №12345 • Создан 28 ноября 2025
                      </CardDescription>
                    </div>
                    <Badge variant="success">Активный</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" fallback="ИП" />
                      <div>
                        <Typography variant="bodySm" weight="semibold">
                          Иван Петров
                        </Typography>
                        <Typography variant="note" color="secondary">
                          Подрядчик
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="bodySm">
                      Требуется полный ремонт ванной комнаты площадью 6 кв.м.
                      Замена плитки, сантехники, электрики.
                    </Typography>
                    <div className="flex items-center justify-between pt-2">
                      <Typography variant="bodySm" color="secondary">
                        Бюджет:
                      </Typography>
                      <Typography variant="h3" className="text-accent-1">
                        150 000 ₽
                      </Typography>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" fullWidth>
                    Посмотреть детали
                  </Button>
                </CardFooter>
              </Card>

              {/* Pending Order */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Уборка квартиры</CardTitle>
                      <CardDescription>
                        Заказ №12344 • Создан 27 ноября 2025
                      </CardDescription>
                    </div>
                    <Badge variant="warning">Ожидание</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    Генеральная уборка трехкомнатной квартиры. Требуется мытье
                    окон, уборка после ремонта.
                  </Typography>
                  <div className="mt-4 flex items-center justify-between">
                    <Typography variant="bodySm" color="secondary">
                      Откликов: 5
                    </Typography>
                    <Typography variant="h3" className="text-accent-1">
                      8 000 ₽
                    </Typography>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" fullWidth>
                    Посмотреть отклики
                  </Button>
                </CardFooter>
              </Card>

              {/* Completed Order */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Дизайн гостиной</CardTitle>
                      <CardDescription>
                        Заказ №12340 • Завершен 20 ноября 2025
                      </CardDescription>
                    </div>
                    <Badge variant="neutral">Завершен</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" fallback="МС" />
                      <div>
                        <Typography variant="bodySm" weight="semibold">
                          Мария Сидорова
                        </Typography>
                        <Typography variant="note" color="secondary">
                          Дизайнер
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="bodySm">
                      Создание дизайн-проекта гостиной с 3D визуализацией.
                      Проект выполнен отлично!
                    </Typography>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                      </div>
                      <Typography variant="bodySm" color="secondary">
                        Вы оставили отзыв
                      </Typography>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" fullWidth>
                    Повторить заказ
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Complex Examples Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Комплексные примеры
            </Typography>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Login Form Example */}
              <Card padding="lg">
                <Typography as="h3" variant="h3" className="mb-4">
                  Форма входа
                </Typography>
                <div className="space-y-4">
                  <Input label="Email" placeholder="your@email.com" fullWidth />
                  <Input
                    label="Пароль"
                    type="password"
                    placeholder="••••••••"
                    fullWidth
                  />
                  <Button fullWidth>Войти</Button>
                  <Button variant="secondary" fullWidth>
                    Зарегистрироваться
                  </Button>
                </div>
              </Card>

              {/* User Profile Card Example */}
              <Card hoverable>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar size="lg" fallback="ИП" online />
                    <div className="flex-1">
                      <Typography variant="h3">Иван Петров</Typography>
                      <Typography variant="bodySm" color="secondary">
                        Подрядчик
                      </Typography>
                    </div>
                    <Badge variant="success">Активен</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    Опытный специалист по ремонту и строительству. Более 10 лет
                    опыта работы.
                  </Typography>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="info" size="sm">
                      Строительство
                    </Badge>
                    <Badge variant="info" size="sm">
                      Ремонт
                    </Badge>
                    <Badge variant="info" size="sm">
                      Дизайн
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Профиль</Button>
                  <Button variant="secondary" size="sm">
                    Написать
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
