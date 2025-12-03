/**
 * PRIMARY BUTTON - TYPESCRIPT TESTS
 * 
 * Тесты типизации для PrimaryButton компонента
 * Эти тесты проверяют корректность TypeScript типов на этапе компиляции
 */

import { PrimaryButton } from './PrimaryButton';
import type { ComponentProps } from 'react';

// ============================================================================
// TYPE EXTRACTION TESTS
// ============================================================================

type PrimaryButtonProps = ComponentProps<typeof PrimaryButton>;

// Проверка, что можно извлечь тип пропсов
const _testPropsExtraction: PrimaryButtonProps = {
  children: 'Test',
};

// ============================================================================
// CHILDREN PROP TESTS
// ============================================================================

// ✅ String children
const _testStringChildren = <PrimaryButton>Text</PrimaryButton>;

// ✅ Number children
const _testNumberChildren = <PrimaryButton>{42}</PrimaryButton>;

// ✅ JSX children
const _testJSXChildren = (
  <PrimaryButton>
    <span>Icon</span> Text
  </PrimaryButton>
);

// ✅ Array children
const _testArrayChildren = (
  <PrimaryButton>
    {['Item 1', 'Item 2']}
  </PrimaryButton>
);

// ============================================================================
// BOOLEAN PROPS TESTS
// ============================================================================

// ✅ isLoading prop
const _testLoadingTrue = <PrimaryButton isLoading>Loading</PrimaryButton>;
const _testLoadingFalse = <PrimaryButton isLoading={false}>Not Loading</PrimaryButton>;

// ✅ disabled prop
const _testDisabledTrue = <PrimaryButton disabled>Disabled</PrimaryButton>;
const _testDisabledFalse = <PrimaryButton disabled={false}>Enabled</PrimaryButton>;

// ✅ fullWidth prop
const _testFullWidthTrue = <PrimaryButton fullWidth>Full Width</PrimaryButton>;
const _testFullWidthFalse = <PrimaryButton fullWidth={false}>Auto Width</PrimaryButton>;

// ============================================================================
// TYPE PROP TESTS
// ============================================================================

// ✅ type="button"
const _testTypeButton = <PrimaryButton type="button">Button</PrimaryButton>;

// ✅ type="submit"
const _testTypeSubmit = <PrimaryButton type="submit">Submit</PrimaryButton>;

// ✅ type="reset"
const _testTypeReset = <PrimaryButton type="reset">Reset</PrimaryButton>;

// ❌ Invalid type should error
// @ts-expect-error - invalid type
const _testInvalidType = <PrimaryButton type="invalid">Invalid</PrimaryButton>;

// ============================================================================
// EVENT HANDLER TESTS
// ============================================================================

// ✅ onClick handler
const _testOnClick = (
  <PrimaryButton onClick={(e) => console.log(e)}>
    Click
  </PrimaryButton>
);

// ✅ onClick with event type
const _testOnClickTyped = (
  <PrimaryButton 
    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log(e.currentTarget);
    }}
  >
    Click
  </PrimaryButton>
);

// ✅ onMouseEnter
const _testOnMouseEnter = (
  <PrimaryButton onMouseEnter={() => console.log('enter')}>
    Hover
  </PrimaryButton>
);

// ✅ onFocus
const _testOnFocus = (
  <PrimaryButton onFocus={() => console.log('focus')}>
    Focus
  </PrimaryButton>
);

// ============================================================================
// CLASSNAME TESTS
// ============================================================================

// ✅ className string
const _testClassName = <PrimaryButton className="custom-class">Custom</PrimaryButton>;

// ✅ className with conditional
const _testConditionalClassName = (
  <PrimaryButton className={true ? 'class-a' : 'class-b'}>
    Conditional
  </PrimaryButton>
);

// ============================================================================
// REF TESTS
// ============================================================================

import { useRef } from 'react';

// ✅ useRef with correct type
function _TestRefComponent() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  return (
    <PrimaryButton ref={buttonRef}>
      With Ref
    </PrimaryButton>
  );
}

// ============================================================================
// COMBINED PROPS TESTS
// ============================================================================

// ✅ All props together
const _testAllProps = (
  <PrimaryButton
    type="submit"
    isLoading={false}
    disabled={false}
    fullWidth={true}
    className="custom"
    onClick={(e) => console.log(e)}
    onMouseEnter={() => {}}
    onFocus={() => {}}
  >
    Full Example
  </PrimaryButton>
);

// ============================================================================
// INVALID PROPS TESTS (should error)
// ============================================================================

// ❌ Invalid prop
// @ts-expect-error - invalid prop
const _testInvalidProp = <PrimaryButton invalidProp="value">Invalid</PrimaryButton>;

// ❌ Invalid isLoading type
// @ts-expect-error - should be boolean
const _testInvalidLoading = <PrimaryButton isLoading="true">Invalid</PrimaryButton>;

// ❌ Invalid disabled type
// @ts-expect-error - should be boolean
const _testInvalidDisabled = <PrimaryButton disabled="yes">Invalid</PrimaryButton>;

// ❌ Invalid fullWidth type
// @ts-expect-error - should be boolean
const _testInvalidFullWidth = <PrimaryButton fullWidth="true">Invalid</PrimaryButton>;

// ============================================================================
// COMPONENT COMPOSITION TESTS
// ============================================================================

// ✅ Inside div
const _testInDiv = (
  <div>
    <PrimaryButton>In Div</PrimaryButton>
  </div>
);

// ✅ Inside form
const _testInForm = (
  <form>
    <PrimaryButton type="submit">Submit</PrimaryButton>
  </form>
);

// ✅ Multiple buttons
const _testMultiple = (
  <div>
    <PrimaryButton>Button 1</PrimaryButton>
    <PrimaryButton>Button 2</PrimaryButton>
    <PrimaryButton>Button 3</PrimaryButton>
  </div>
);

// ✅ Conditional rendering
const _testConditional = (
  <div>
    {true && <PrimaryButton>Conditional</PrimaryButton>}
    {false || <PrimaryButton>Or</PrimaryButton>}
  </div>
);

// ============================================================================
// DEFAULT EXPORT TEST
// ============================================================================

// Компонент должен быть именованным экспортом
import { PrimaryButton as NamedExport } from './PrimaryButton';

const _testNamedExport = <NamedExport>Named</NamedExport>;

// ============================================================================
// DISPLAY NAME TEST
// ============================================================================

// Компонент должен иметь displayName
const _displayName: string = PrimaryButton.displayName || '';

// ============================================================================
// TYPE SUMMARY
// ============================================================================

/**
 * Сводка поддерживаемых типов:
 * 
 * interface PrimaryButtonProps {
 *   // Standard HTML button attributes
 *   children: ReactNode;
 *   type?: 'button' | 'submit' | 'reset';
 *   disabled?: boolean;
 *   onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
 *   className?: string;
 *   
 *   // Custom props
 *   isLoading?: boolean;
 *   fullWidth?: boolean;
 *   
 *   // Ref support
 *   ref?: Ref<HTMLButtonElement>;
 *   
 *   // All other HTML button attributes
 *   ...ButtonHTMLAttributes<HTMLButtonElement>
 * }
 */

export type { PrimaryButtonProps };
