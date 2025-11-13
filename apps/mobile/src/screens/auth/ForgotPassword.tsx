// apps/mobile/src/screens/ForgotPassword.tsx
import React, { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ArrowLeft } from 'lucide-react-native'
import { TouchableOpacity, View } from 'react-native'
import Button from '~/components/common/Button'
import { Input } from '~/components/common/TextInputField'
import AuthLayout from '~/components/auth/AuthLayout'
import { AuthStackParamList } from '~/navigations/AuthNavigator'
import { validateForgotPassword, ForgotPasswordFormErrors } from '../../utils/validator'
import { authService } from '~/services/auth.service'
import { useAlert } from '~/hooks/useAlert'; 

type ForgotPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordNavProp>()
  const { success } = useAlert();

  const [step, setStep] = useState<'email' | 'token' | 'password'>('email')
  const [form, setForm] = useState({
    email: '',
    token: '',
    password: '',
  })
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({
    email: '',
    token: '',
    password: '',
  })

  // 🔹 Validate while typing
  const handleChange = (key: keyof typeof form, value: string) => {
    const updatedForm = { ...form, [key]: value }
    setForm(updatedForm)

    const validationErrors = validateForgotPassword(updatedForm, step)
    setErrors((prev: any) => ({ ...prev, ...validationErrors }))
  }

  const handleNext = useCallback(async () => {
    const validationErrors = validateForgotPassword(form, step)
    setErrors(validationErrors)

    if (step === 'email' && !validationErrors.email) {
      const res = await authService.forgotPassword(form.email.trim());

      console.log(res);

      setStep('token')
    } else if (step === 'token' && !validationErrors.token) {
      setStep('password')
    } else if (step === 'password' && !validationErrors.password) {
      console.log('✅ Reset password with:', form)

      const res = await authService.resetPassword(form.token, form.password);
      console.log(res)

      success('Password Reset', 'Your password has been reset successfully!', () => {
        navigation.navigate('Login');
      });
    }
  }, [form, step, navigation, success])

  const handleBack = () => {
    if (step === 'password') setStep('token')
    else if (step === 'token') setStep('email')
    else if (step === 'email') navigation.navigate('Login')
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={
        step === 'email'
          ? 'Enter your email to receive a reset token'
          : step === 'token'
          ? 'Enter the token sent to your email'
          : 'Set your new password'
      }
    >
      {/* 🔙 Back Button at Top */}
      <View className="absolute left-4 top-4 z-10">
        <TouchableOpacity onPress={handleBack} className="flex-row items-center">
          <ArrowLeft size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {step === 'email' && (
        <>
          <Input
            label="Email"
            placeholder="youremail@gmail.com"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <Button title="Send Reset Token" onPress={handleNext} />
        </>
      )}

      {step === 'token' && (
        <>
          <Input
            label="Token"
            placeholder="Enter token"
            value={form.token}
            onChangeText={(text) => handleChange('token', text)}
            autoCapitalize="none"
            error={errors.token}
          />
          <Button title="Verify Token" onPress={handleNext} />
        </>
      )}

      {step === 'password' && (
        <>
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry
            error={errors.password}
          />
          <Button title="Reset Password" onPress={handleNext} />
        </>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
