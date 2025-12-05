'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Checkbox,
  Container,
  Radio,
  SearchInput,
  Select,
  Spinner,
  Textarea,
  Toggle,
  PrimaryButton,
  Icon,
  Tag,
  ClaimedTag,
  DoneTag,
  ReviewedTag,
  CategoryCard
} from '@/src/shared/ui';
import { Header } from '@/src/widgets/header/Header';
import { Typography } from '@shared/ui/typography';
import { SecondaryButton } from '@/src/shared/ui/button/SecondaryButton';
import { useTranslations } from 'next-intl';
import { IconButton } from '@/src/shared/ui/button/IconButton';
import { LinkButton, LogoButton } from '@shared/ui/button';
import { Input, PasswordInput, EmailInput, ChatInput } from '@shared/ui/inputs';
import { TextArea } from '@shared/ui/text-area';
import { mockCategories } from '@/src/shared/ui/cards/category-card';
import { ContractorCard } from '@/src/shared/ui/cards/contractor';
import { OrderCard } from '@/src/shared/ui/cards/order';
import { Dropdown } from '@/src/shared/ui';

const options = [
  { value: 'home-cleaning', label: 'Home cleaning' },
  { value: 'post-renovation', label: 'Post-renovation cleaning' },
  { value: 'window-cleaning', label: 'Window cleaning' },
  { value: 'move-in-out', label: 'Move-in / move-out cleaning' },
];



export default function DesignSystemShowcase() {
    const t = useTranslations('landing.header');
  
  const [searchValue, setSearchValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [toggleValue, setToggleValue] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  const cleaningOptions = [
  { value: 'home', label: 'Home cleaning' },
  { value: 'renovation', label: 'Post-renovation cleaning' },
  { value: 'window', label: 'Window cleaning' },
  { value: 'move', label: 'Move-in / move-out cleaning' },
];

  return (
    <div className="min-h-screen bg-background-tertiary py-12">
      <Container maxWidth="2xl">
        {/* Logo and Header */}
      
        <div className="space-y-16">
          {/* Header Variants Section */}
          
            <Header/>
          
           <SecondaryButton isLoading>
              <Icon name="google" className="h-5 w-5" color="inherit" />
              <Typography variant='h3' color="inherit">{t('signInSignUp')}</Typography> 
           </SecondaryButton>

           <IconButton iconName="google" size="md" ariaLabel="Sign in with Google" />
           <LinkButton href="/profile">View Profile</LinkButton>

          {/* Logo Button Section */}
          <section>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Logo Button</CardTitle>
                <CardDescription>
                  Circular logo button with different states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Default State */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Default
                  </Typography>
                  <div className="flex items-center gap-4">
                    <LogoButton onClick={() => console.log('Logo button clicked')} />
                    <Typography variant="note" color="secondary">
                      Normal state - green background with white checkmark icon
                    </Typography>
                  </div>
                </div>

                {/* Hover State */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Hover
                  </Typography>
                  <div className="flex items-center gap-4">
                    <LogoButton onClick={() => console.log('Logo button clicked')} />
                    <Typography variant="note" color="secondary">
                      Hover over the button to see lighter green background
                    </Typography>
                  </div>
                </div>

                {/* Pressed State */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Pressed
                  </Typography>
                  <div className="flex items-center gap-4">
                    <LogoButton onClick={() => console.log('Logo button clicked')} />
                    <Typography variant="note" color="secondary">
                      Click and hold to see light green background with darker icon
                    </Typography>
                  </div>
                </div>

                {/* Disabled State */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Disabled
                  </Typography>
                  <div className="flex items-center gap-4">
                    <LogoButton disabled />
                    <Typography variant="note" color="secondary">
                      Disabled state - muted green background, not clickable
                    </Typography>
                  </div>
                </div>

                {/* Loading State */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Loading
                  </Typography>
                  <div className="flex items-center gap-4">
                    <LogoButton isLoading />
                    <Typography variant="note" color="secondary">
                      Loading state - light green background with spinner
                    </Typography>
                  </div>
                </div>

                {/* All States Together */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    All States
                  </Typography>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex flex-col items-center gap-2">
                      <LogoButton onClick={() => console.log('Default clicked')} />
                      <Typography variant="note" color="secondary">
                        Default
                      </Typography>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <LogoButton disabled />
                      <Typography variant="note" color="secondary">
                        Disabled
                      </Typography>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <LogoButton isLoading />
                      <Typography variant="note" color="secondary">
                        Loading
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>


<Input placeholder="Text" />


<Input placeholder="Text" leftIcon="email" />


<Input placeholder="Text" value="Filled info" filled readOnly />


<Input placeholder="Text" error errorText="Invalid Email" />


<Input placeholder="Text" disabled />


<PasswordInput placeholder="Password" />


<EmailInput placeholder="Email" />


<ContractorCard
  id="1"
  category="Plumbing"
  name="John Smith"
  photo="/images/contractors/john-smith.jpg"
  location="Toronto"
  hourlyRate={40}
  rating={4.9}
  tasksCompleted={43}
  onViewProfile={(id) => console.log('View profile:', id)}
/>

<Select
  options={cleaningOptions}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Search..."
  searchable
/>

<Dropdown
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Cle"
/>


// Default
<TextArea placeholder="Input text" />

// Focused/Filled с текстом
<TextArea 
  value="Looking for a plumber to replace a broken faucet in the bathroom..."
  placeholder="Input text"
/>

// Disabled
<TextArea disabled placeholder="Input text" />

// Error с превышением лимита
<TextArea 
  error
  errorText="Text is too long"
  value="Looking for a plumber to replace a broken faucet in the bathroom..."
  maxLength={500}
/>

// С лейблом
<TextArea 
  label="Description"
  placeholder="Enter your description"
  maxLength={500}
/>

// Без счётчика
<TextArea 
  placeholder="Input text"
  showCounter={false}
/>

// С автоматическим изменением высоты
<TextArea 
  placeholder="Input text"
  autoResize
/>

          {/* Chat Input Section */}
          <section>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Chat Input</CardTitle>
                <CardDescription>
                  Компонент для ввода сообщений в чате с поддержкой прикрепления файлов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Standard
                  </Typography>
                  <ChatInput
                    placeholder="Введите сообщение..."
                    onSend={(message, file) => {
                      console.log('Message:', message);
                      console.log('File:', file);
                    }}
                  />
                </div>

                {/* Without Attachment Button */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Without Attachment
                  </Typography>
                  <ChatInput
                    placeholder="Только текст..."
                    onSend={(message) => console.log('Message:', message)}
                    showAttachment={false}
                  />
                </div>

                {/* Disabled */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Disabled
                  </Typography>
                  <ChatInput
                    placeholder="Недоступно..."
                    onSend={() => {}}
                    disabled
                  />
                </div>

                {/* Custom Max Length */}
                <div>
                  <Typography variant="bodySm" weight="semibold" className="mb-3">
                    Custom Max Length (100 chars)
                  </Typography>
                  <ChatInput
                    placeholder="Короткое сообщение..."
                    onSend={(message) => console.log('Message:', message)}
                    maxLength={100}
                  />
                </div>
              </CardContent>
            </Card>
          </section>











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
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-background-primary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Primary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      background-primary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-background-secondary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Secondary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      background-secondary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-background-tertiary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Tertiary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      background-tertiary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-background-card" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Card
                    </Typography>
                    <Typography variant="note" color="secondary">
                      background-card
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <div className="mb-8">
              <Typography as="h3" variant="h3" className="mb-4">
                Цвета текста
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-text-primary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Primary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      text-primary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-text-secondary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Secondary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      text-secondary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-text-tertiary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Tertiary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      text-tertiary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-text-link" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Link
                    </Typography>
                    <Typography variant="note" color="secondary">
                      text-link
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="mb-8">
              <Typography as="h3" variant="h3" className="mb-4">
                Акцентные цвета
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-accent-primary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Primary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      accent-primary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-accent-secondary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Secondary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      accent-secondary
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-accent-tertiary" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Tertiary
                    </Typography>
                    <Typography variant="note" color="secondary">
                      accent-tertiary
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Colors */}
            <div>
              <Typography as="h3" variant="h3" className="mb-4">
                Цвета обратной связи
              </Typography>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-feedback-error" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Error
                    </Typography>
                    <Typography variant="note" color="secondary">
                      feedback-error
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-feedback-success" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Success
                    </Typography>
                    <Typography variant="note" color="secondary">
                      feedback-success
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-feedback-warning" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Warning
                    </Typography>
                    <Typography variant="note" color="secondary">
                      feedback-warning
                    </Typography>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border-primary shadow">
                  <div className="h-24 w-full bg-feedback-info" />
                  <div className="bg-background-card p-3">
                    <Typography variant="bodySm" weight="semibold">
                      Info
                    </Typography>
                    <Typography variant="note" color="secondary">
                      feedback-info
                    </Typography>
                  </div>
                </div>
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
              <div className="space-y-8">
                {/* Default States */}
                <div>
                  <Typography variant="h3" className="mb-4">
                    Основные состояния
                  </Typography>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="w-48">
                        <Checkbox />
                      </div>
                      <Typography variant="bodySm" color="secondary">
                        Unchecked
                      </Typography>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-48">
                        <Checkbox checked readOnly />
                      </div>
                      <Typography variant="bodySm" color="secondary">
                        Checked
                      </Typography>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-48">
                        <Checkbox disabled />
                      </div>
                      <Typography variant="bodySm" color="secondary">
                        Disabled (unchecked)
                      </Typography>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-48">
                        <Checkbox checked disabled />
                      </div>
                      <Typography variant="bodySm" color="secondary">
                        Disabled (checked)
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* With Labels */}
                <div>
                  <Typography variant="h3" className="mb-4">
                    С текстовыми метками
                  </Typography>
                  <div className="space-y-4">
                    <Checkbox
                      label="Я согласен с условиями использования"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                    />
                    <Checkbox label="Получать уведомления по email" />
                    <Checkbox label="Запомнить меня" checked readOnly />
                    <Checkbox label="Отключенный чекбокс" disabled />
                    <Checkbox label="Отключенный выбранный" checked disabled />
                  </div>
                </div>

                {/* With Error State */}
                <div>
                  <Typography variant="h3" className="mb-4">
                    С состоянием ошибки
                  </Typography>
                  <div className="space-y-4">
                    <Checkbox
                      label="Необходимо принять условия"
                      error="Это поле обязательно для заполнения"
                    />
                  </div>
                </div>

                {/* In Form Context */}
                <div>
                  <Typography variant="h3" className="mb-4">
                    В контексте формы
                  </Typography>
                  <div className="rounded-lg bg-background-secondary p-6">
                    <Typography variant="bodySm" weight="semibold" className="mb-4">
                      Настройки уведомлений
                    </Typography>
                    <div className="space-y-3">
                      <Checkbox label="Email уведомления о новых заказах" defaultChecked />
                      <Checkbox label="Push-уведомления в браузере" />
                      <Checkbox label="SMS уведомления (платная услуга)" />
                      <Checkbox label="Еженедельная сводка активности" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* In List Context */}
                <div>
                  <Typography variant="h3" className="mb-4">
                    В списке задач
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg bg-background-secondary p-3">
                      <Checkbox defaultChecked />
                      <Typography variant="bodySm" className="line-through text-text-secondary">
                        Завершить дизайн главной страницы
                      </Typography>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-background-secondary p-3">
                      <Checkbox />
                      <Typography variant="bodySm">
                        Провести код-ревью PR #234
                      </Typography>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-background-secondary p-3">
                      <Checkbox />
                      <Typography variant="bodySm">
                        Обновить документацию API
                      </Typography>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-background-secondary p-3">
                      <Checkbox defaultChecked />
                      <Typography variant="bodySm" className="line-through text-text-secondary">
                        Написать unit тесты для компонентов
                      </Typography>
                    </div>
                  </div>
                </div>
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

          {/* Tags Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Task Tags
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Варианты
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <ClaimedTag />
                    <DoneTag />
                    <ReviewedTag />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    С кастомными текстами
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <ClaimedTag label="В работе" />
                    <DoneTag label="Выполнено" />
                    <ReviewedTag label="Проверено" />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Размеры
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="bodySm" color="secondary" className="mb-2">
                        Small (sm)
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        <ClaimedTag size="sm" />
                        <DoneTag size="sm" />
                        <ReviewedTag size="sm" />
                      </div>
                    </div>
                    <div>
                      <Typography variant="bodySm" color="secondary" className="mb-2">
                        Medium (md) - Default
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        <ClaimedTag size="md" />
                        <DoneTag size="md" />
                        <ReviewedTag size="md" />
                      </div>
                    </div>
                    <div>
                      <Typography variant="bodySm" color="secondary" className="mb-2">
                        Large (lg)
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        <ClaimedTag size="lg" />
                        <DoneTag size="lg" />
                        <ReviewedTag size="lg" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    В списке задач
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-background-secondary p-3">
                      <Typography variant="bodySm">Fix login bug</Typography>
                      <ClaimedTag size="sm" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-background-secondary p-3">
                      <Typography variant="bodySm">Update documentation</Typography>
                      <DoneTag size="sm" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-background-secondary p-3">
                      <Typography variant="bodySm">Code review</Typography>
                      <ReviewedTag size="sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Базовый компонент Tag
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Tag variant="claimed">Claimed</Tag>
                    <Tag variant="done">Done</Tag>
                    <Tag variant="reviewed">Reviewed</Tag>
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
                  <PrimaryButton size="sm">Действие</PrimaryButton>
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
                  <PrimaryButton size="sm">Действие</PrimaryButton>
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
                  <PrimaryButton size="sm">Действие</PrimaryButton>
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
                    <div className="rounded-lg bg-accent-primary p-4">
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
              <div className="overflow-hidden rounded-xl border border-border-primary shadow">
                <div className="h-48 w-full bg-gradient-main" />
                <div className="bg-background-card p-4">
                  <Typography variant="bodySm" weight="semibold">
                    Main градиент
                  </Typography>
                  <Typography variant="note" color="secondary">
                    bg-gradient-main
                  </Typography>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border-primary shadow">
                <div className="h-48 w-full bg-gradient-card" />
                <div className="bg-background-card p-4">
                  <Typography variant="bodySm" weight="semibold">
                    Card градиент
                  </Typography>
                  <Typography variant="note" color="secondary">
                    bg-gradient-card
                  </Typography>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border-primary shadow">
                <div className="h-48 w-full bg-gradient-banner" />
                <div className="bg-background-card p-4">
                  <Typography variant="bodySm" weight="semibold">
                    Banner градиент
                  </Typography>
                  <Typography variant="note" color="secondary">
                    bg-gradient-banner
                  </Typography>
                </div>
              </div>
            </div>
          </section>

          {/* Category Cards Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Category Cards (FSD Component)
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
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

          {/* Order Cards Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Order Cards
            </Typography>
            <div className="space-y-6">
              <OrderCard
                id="1"
                clientName="Mary K."
                clientPhoto="/images/clients/mary-k.jpg"
                title="Cleaning of 2-floors House"
                description="Need full cleaning of a two-floor house, including floors, dusting, bathrooms, and kitchen. Looking for a thorough, detailed clean."
                location="Toronto"
                startDate="2024-11-13"
                endDate="2024-11-20"
                startTime="10:00"
                endTime="14:00"
                onRespond={(id) => console.log('Respond to order:', id)}
                onLocationClick={(id) => console.log('View location:', id)}
              />
              <OrderCard
                id="2"
                clientName="John S."
                title="Plumbing Repair - Kitchen Sink"
                description="Kitchen sink is leaking underneath. Need urgent plumbing repair. The leak is getting worse and water is pooling under the cabinet."
                location="Vancouver"
                startDate="2024-11-14"
                endDate="2024-11-14"
                startTime="09:00"
                endTime="12:00"
                onRespond={(id) => console.log('Respond to order:', id)}
                onLocationClick={(id) => console.log('View location:', id)}
              />
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
                  <PrimaryButton size="sm">Посмотреть профиль</PrimaryButton>
                  <PrimaryButton variant="secondary" size="sm">
                    Написать
                  </PrimaryButton>
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
                  <PrimaryButton size="sm">Посмотреть профиль</PrimaryButton>
                  <PrimaryButton variant="secondary" size="sm">
                    Написать
                  </PrimaryButton>
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
                      <Typography variant="h3" className="text-accent-primary">
                        150 000 ₽
                      </Typography>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <PrimaryButton size="sm" fullWidth>
                    Посмотреть детали
                  </PrimaryButton>
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
                    <Typography variant="h3" className="text-accent-primary">
                      8 000 ₽
                    </Typography>
                  </div>
                </CardContent>
                <CardFooter>
                  <PrimaryButton size="sm" fullWidth>
                    Посмотреть отклики
                  </PrimaryButton>
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
                  <PrimaryButton variant="secondary" size="sm" fullWidth>
                    Повторить заказ
                  </PrimaryButton>
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
                  <PrimaryButton fullWidth>Войти</PrimaryButton>
                  <PrimaryButton variant="secondary" fullWidth>
                    Зарегистрироваться
                  </PrimaryButton>
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
                  <PrimaryButton size="sm">Профиль</PrimaryButton>
                  <PrimaryButton variant="secondary" size="sm">
                    Написать
                  </PrimaryButton>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
