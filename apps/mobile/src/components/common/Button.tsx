// apps/mobile/src/components/common/Button.tsx
import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string // ✅ custom button styles
  textClassName?: string // ✅ custom text styles
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  textClassName = '',
}) => {
  const getButtonStyles = () => {
    const base =
      size === 'sm'
        ? 'rounded-lg py-2 px-3'
        : size === 'lg'
        ? 'rounded-xl py-5 px-7'
        : 'rounded-xl py-4 px-6'

    const baseStyles = `${base} items-center shadow-sm`

    if (disabled || loading) {
      return `${baseStyles} opacity-50 ${className}`
    }

    switch (variant) {
      case 'secondary':
        return `${baseStyles} bg-craftopia-digital ${className}`
      case 'outline':
        return `${baseStyles} bg-transparent border-2 border-craftopia-neural ${className}`
      default:
        return `${baseStyles} bg-craftopia-neural ${className}`
    }
  }

  const getTextStyles = () => {
    const textSize =
      size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'

    if (variant === 'outline') {
      return `text-craftopia-neural ${textSize} font-semibold ${textClassName}`
    }
    return `text-white ${textSize} font-semibold ${textClassName}`
  }

  return (
    <TouchableOpacity
      className={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

export default Button
