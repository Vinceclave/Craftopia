// components/auth/login/LoginHeader.tsx
import React from 'react';
import { MotiText } from 'moti';

const LoginHeader = () => {
  return (
    <>
      <MotiText
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        className="text-2xl leading-7 font-luckiest tracking-wide text-forest text-center mb-1"
      >
        Welcome Back
      </MotiText>

      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 200, duration: 500 }}
        className="text-sm leading-5 text-center text-darkgray mb-4 font-openSans font-light"
      >
        Log in to continue your eco journey.
      </MotiText>
    </>
  );
};

export default LoginHeader;
