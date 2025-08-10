import React from 'react';
import { MotiText } from 'moti';

const RegisterHeader = () => {
  return (
    <>
      <MotiText
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        className="text-xl leading-7 font-luckiest tracking-wide text-forest text-center mb-1"
      >
        Create Your Eco Account
      </MotiText>

      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 200, duration: 500 }}
        className="text-xs leading-5 text-center text-darkgray mb-4 font-openSans font-light"
      >
        Create. Reuse. Inspire.
      </MotiText>
    </>
  );
};

export default RegisterHeader;
