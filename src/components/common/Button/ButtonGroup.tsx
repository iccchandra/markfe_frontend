import React, { ReactNode, Children, cloneElement, isValidElement } from 'react';
import { ButtonProps } from './Button';

export interface ButtonGroupProps {
  /** Button group children */
  children: ReactNode;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Attached buttons */
  attached?: boolean;
  /** Size for all buttons */
  size?: ButtonProps['size'];
  /** Variant for all buttons */
  variant?: ButtonProps['variant'];
  /** Disabled state for all buttons */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  attached = false,
  size,
  variant,
  disabled,
  className = '',
}) => {
  const isVertical = orientation === 'vertical';

  const groupClassName = [
    'inline-flex',
    isVertical ? 'flex-col' : 'flex-row',
    attached ? (isVertical ? '-space-y-px' : '-space-x-px') : (isVertical ? 'space-y-2' : 'space-x-2'),
    className,
  ].filter(Boolean).join(' ');

  const enhancedChildren = Children.map(children, (child, index) => {
    if (!isValidElement<ButtonProps>(child)) return child;

    const childCount = Children.count(children);
    const isFirst = index === 0;
    const isLast = index === childCount - 1;
    const isMiddle = !isFirst && !isLast;

    let additionalProps: Partial<ButtonProps> = {};

    // Apply group props
    if (size) additionalProps.size = size;
    if (variant) additionalProps.variant = variant;
    if (disabled) additionalProps.disabled = disabled;

    // Handle attached styling
    if (attached) {
      let shapeClass = '';

      if (isVertical) {
        if (isFirst) shapeClass = 'rounded-b-none';
        else if (isLast) shapeClass = 'rounded-t-none';
        else if (isMiddle) shapeClass = 'rounded-none';
      } else {
        if (isFirst) shapeClass = 'rounded-r-none';
        else if (isLast) shapeClass = 'rounded-l-none';
        else if (isMiddle) shapeClass = 'rounded-none';
      }

      // Safely access child.props.className with type safety
      additionalProps.className = `${(child.props.className as string | undefined) || ''} ${shapeClass}`.trim();
    }

    return cloneElement(child, additionalProps);
  });

  return (
    <div className={groupClassName} role="group">
      {enhancedChildren}
    </div>
  );
};