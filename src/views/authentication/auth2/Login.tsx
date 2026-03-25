import { useState } from "react";
import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";

import AuthLogin from "../authforms/AuthLogin";

import FullLogo from "src/layouts/full/shared/logo/FullLogo";


const Login = () => {
  const [cooldown, setCooldown] = useState(0);

  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto flex justify-center">
              <FullLogo className="h-16 w-auto" />
            </div>
            <AuthLogin onCooldownUpdate={setCooldown} />
            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <p className={`hidden`}>New to QiYOUAdmin?</p>
              <Link
                to={"/admin/auth/register"}
                className={`hidden text-primary text-sm font-medium ${cooldown > 0 ? 'pointer-events-none opacity-50' : ''}`}
                onClick={(e) => cooldown > 0 && e.preventDefault()}
              >
                Create an account
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default Login;
