'use client';

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
  Container,
  Input,
  Spinner,
  Typography,
} from '@/components/ui';
import { colors, gradients } from '@/lib/design-tokens';

export default function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-background-3 py-12">
      <Container maxWidth="2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Typography as="h1" variant="h1" className="mb-4">
            Design System Showcase
          </Typography>
          <Typography variant="body" color="secondary">
            A comprehensive view of all design tokens and components
          </Typography>
        </div>

        <div className="space-y-16">
          {/* Colors Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Color Palette
            </Typography>

            {/* Backgrounds */}
            <div className="mb-8">
              <Typography as="h3" variant="h3" className="mb-4">
                Backgrounds
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
                Text Colors
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
                Accent Colors
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
                Feedback Colors
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
              Typography
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography as="h1" variant="h1">
                    Headline 1 - The quick brown fox jumps over the lazy dog
                  </Typography>
                </div>
                <div>
                  <Typography as="h2" variant="h2">
                    Headline 2 - The quick brown fox jumps over the lazy dog
                  </Typography>
                </div>
                <div>
                  <Typography as="h3" variant="h3">
                    Headline 3 - The quick brown fox jumps over the lazy dog
                  </Typography>
                </div>
                <div>
                  <Typography variant="body">
                    Body Text - The quick brown fox jumps over the lazy dog.
                    This is the default body text style used throughout the
                    application for main content.
                  </Typography>
                </div>
                <div>
                  <Typography variant="bodySm">
                    Body Small - The quick brown fox jumps over the lazy dog.
                    This is used for secondary content and descriptions.
                  </Typography>
                </div>
                <div>
                  <Typography variant="tag">
                    TAG TEXT - Used for badges and labels
                  </Typography>
                </div>
                <div>
                  <Typography variant="note" color="secondary">
                    Additional notes - Small text for hints and helper text
                  </Typography>
                </div>
              </div>
            </Card>
          </section>

          {/* Buttons Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Buttons
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Variants
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="danger">Danger Button</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Sizes
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    States
                  </Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button>Normal</Button>
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Inputs Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Form Inputs
            </Typography>
            <Card padding="lg">
              <div className="grid gap-6 lg:grid-cols-2">
                <Input label="Email" placeholder="Enter your email" />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  hint="Must be at least 8 characters"
                />
                <Input
                  label="With Error"
                  placeholder="Enter value"
                  error="This field is required"
                />
                <Input label="Disabled" placeholder="Disabled input" disabled />
              </div>
            </Card>
          </section>

          {/* Badges Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Badges
            </Typography>
            <Card padding="lg">
              <div className="space-y-4">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Variants
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Sizes
                  </Typography>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Cards Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Cards
            </Typography>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>
                    This is a standard card with default styling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    Card content goes here. This can include any type of
                    content.
                  </Typography>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Gradient Card</CardTitle>
                  <CardDescription>
                    Card with a beautiful gradient background
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    The gradient creates a subtle visual effect.
                  </Typography>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="outlined" hoverable>
                <CardHeader>
                  <CardTitle>Outlined Card</CardTitle>
                  <CardDescription>
                    Hover over this card to see the effect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySm">
                    This card is hoverable and has an outline style.
                  </Typography>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Avatars Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Avatars
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Sizes
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar size="xs" fallback="XS" />
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" />
                    <Avatar size="lg" fallback="LG" />
                    <Avatar size="xl" fallback="XL" />
                    <Avatar size="2xl" fallback="2XL" />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Shapes
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar shape="circle" fallback="JD" />
                    <Avatar shape="square" fallback="JD" />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Online Status
                  </Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar fallback="ON" online />
                    <Avatar fallback="OFF" online={false} />
                  </div>
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Avatar Group
                  </Typography>
                  <AvatarGroup max={4}>
                    <Avatar fallback="JD" />
                    <Avatar fallback="SM" />
                    <Avatar fallback="AB" />
                    <Avatar fallback="CD" />
                    <Avatar fallback="EF" />
                    <Avatar fallback="GH" />
                  </AvatarGroup>
                </div>
              </div>
            </Card>
          </section>

          {/* Loading States Section */}
          <section>
            <Typography as="h2" variant="h2" className="mb-6">
              Loading States
            </Typography>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Sizes
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
                    With Label
                  </Typography>
                  <Spinner label="Loading..." />
                </div>

                <div>
                  <Typography variant="h3" className="mb-3">
                    Variants
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
              Gradients
            </Typography>
            <div className="grid gap-6 lg:grid-cols-3">
              {Object.entries(gradients).map(([key, value]) => (
                <div
                  key={key}
                  className="overflow-hidden rounded-xl border border-text-unfocused/20 shadow"
                >
                  <div
                    className="h-48 w-full"
                    style={{ background: value }}
                  />
                  <div className="bg-background-1 p-4">
                    <Typography variant="bodySm" weight="semibold">
                      {key.charAt(0).toUpperCase() + key.slice(1)} Gradient
                    </Typography>
                    <Typography variant="note" color="secondary">
                      {value}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
