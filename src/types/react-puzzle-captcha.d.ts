declare module 'react-puzzle-captcha' {
  interface VerifySuccessData {
    left: number;
    destX: number;
    verified: boolean;
  }

  interface VerifyResult {
    spliced: boolean;
    verified: boolean;
  }

  interface VerifyProps {
    onSuccess?: () => void;
    onRefresh?: () => void;
    onCustomverify?: (data: VerifySuccessData) => VerifyResult;
  }

  export const Verify: React.FC<VerifyProps>;
}
